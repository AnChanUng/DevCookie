package com.csstudy.backend.service;

import com.csstudy.backend.entity.ExamProgress;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.ExamProgressRepository;
import com.csstudy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.locks.ReentrantLock;

// 문제집 풀이 기록 저장. 로그인 직후에는 한 사용자의 문제집 수십 개가 한꺼번에 저장되므로,
// DB 커넥션을 쥔 채로 사용자 행 잠금을 기다리는 요청이 쌓이지 않게 한다
@Service
@RequiredArgsConstructor
public class ExamProgressService {

    public static final int MAX_DATA_LENGTH = 200_000;
    // 같은 사용자의 저장은 커넥션을 얻기 전에 여기서 줄을 선다. 사용자 ID로 나눈 잠금 64개를 돌려 쓴다
    private static final ReentrantLock[] LOCKS = new ReentrantLock[64];
    static {
        for (int i = 0; i < LOCKS.length; i++) LOCKS[i] = new ReentrantLock();
    }

    private final ExamProgressRepository progressRepository;
    private final UserRepository users;
    private final ExamProgressMerge merge;
    private final MembershipService membership;
    private final PromotionNoticeService notices;
    private final org.springframework.transaction.support.TransactionTemplate transactions;

    public record Saved(ExamProgress progress, boolean tooLarge) {}

    // 잠금을 먼저 잡고 그 안에서 짧은 트랜잭션을 연다. 기다리는 동안에는 DB 커넥션을 쓰지 않는다.
    // 여러 서버로 늘어나도 맞도록 트랜잭션 안의 사용자 행 잠금(FOR UPDATE)은 그대로 둔다
    public Saved save(Long userId, String company, String data) {
        ReentrantLock lock = LOCKS[(int) Math.floorMod(userId, (long) LOCKS.length)];
        lock.lock();
        try {
            return transactions.execute(status -> saveLocked(userId, company, data));
        } finally {
            lock.unlock();
        }
    }

    // TransactionTemplate 안에서만 부른다
    private Saved saveLocked(Long userId, String company, String data) {
        User user = users.findForUpdate(userId).orElseThrow();
        // 등급 계산은 문제집마다 저장해 둔 푼 문제 수를 더하므로 다른 문제집 JSON을 다시 읽지 않는다.
        // 값이 없는 예전 행은 여기서 한 번만 채워 둔다
        progressRepository.findByUserIdAndSolvedCountIsNull(userId)
                .forEach(p -> p.setSolvedCount((int) membership.solvedIn(p.getData())));
        var before = membership.membership(user);
        ExamProgress progress = progressRepository.findByUserIdAndCompany(userId, company)
                .orElseGet(() -> ExamProgress.builder().user(user).company(company).build());
        String merged = merge.merge(progress.getData(), data);
        if (merged.length() > MAX_DATA_LENGTH) return new Saved(null, true);
        progress.setData(merged);
        progress.setSolvedCount((int) membership.solvedIn(merged));
        ExamProgress saved = progressRepository.saveAndFlush(progress);
        notices.announce("user:" + userId, before, membership.membership(user));
        return new Saved(saved, false);
    }
}
