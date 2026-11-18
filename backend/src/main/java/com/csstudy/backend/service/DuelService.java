package com.csstudy.backend.service;

import com.csstudy.backend.entity.Duel;
import com.csstudy.backend.repository.DuelRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

// 대결 방을 만들고 이어 주는 일. 같은 요청이 한꺼번에 몰려도 방이 하나만 생기게 한다
@Service
@RequiredArgsConstructor
public class DuelService {

    // 헷갈리는 글자(0·O, 1·I·L)는 빼고 방 번호를 만든다
    private static final String CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DuelRepository duelRepository;
    private final ObjectMapper json;

    // 같은 요청 키로 다시 오면(응답을 못 받고 다시 누른 경우 등) 처음 만든 방을 돌려준다.
    // 키 확인과 저장 사이에 같은 키가 끼어들면 create_key의 유일 제약이 막고, 먼저 저장된 방을 다시 읽는다
    public Duel create(List<String> ids, boolean open, String title, String key) throws JsonProcessingException {
        if (key != null) {
            Optional<Duel> existing = duelRepository.findByCreateKey(key);
            if (existing.isPresent()) return existing.get();
        }
        try {
            return duelRepository.saveAndFlush(newDuel(ids, open, title, key));
        } catch (DataIntegrityViolationException e) {
            if (key == null) throw e;
            return duelRepository.findByCreateKey(key).orElseThrow(() -> e);
        }
    }

    // 끝난 방에서 "한 판 더"를 누르면 다음 방을 연다. 앞 방 행을 잠근 채로 확인하고 만들기 때문에,
    // 여럿이 동시에 눌러도 한 명만 방을 만들고 나머지는 그 방 번호를 받는다
    @Transactional
    public Optional<String> rematch(String code, List<String> ids) throws JsonProcessingException {
        Optional<Duel> found = duelRepository.findForUpdate(code);
        if (found.isEmpty()) return Optional.empty();
        Duel duel = found.get();
        if (duel.getNextCode() == null) {
            // 재대결 방은 앞 방의 공개 여부와 이름을 그대로 물려받는다
            Duel next = duelRepository.save(newDuel(ids, Boolean.TRUE.equals(duel.getOpen()), duel.getTitle(), null));
            duel.setNextCode(next.getCode());
        }
        return Optional.of(duel.getNextCode());
    }

    private Duel newDuel(List<String> ids, boolean open, String title, String key) throws JsonProcessingException {
        return Duel.builder().code(newCode()).questionIds(json.writeValueAsString(ids))
                .open(open).title(title).createKey(key).createdAt(Instant.now()).build();
    }

    private String newCode() {
        while (true) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < CODE_LENGTH; i++) sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            String code = sb.toString();
            if (!duelRepository.existsByCode(code)) return code;
        }
    }
}
