package com.csstudy.backend.controller;

import com.csstudy.backend.repository.UsageEventRepository;
import com.csstudy.backend.service.VisitorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

// 문제를 매일 푼 사람 순위. 풀이 완료 기록(usage_events의 exam)에서 오늘까지 이어진 연속 일수를 센다
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RankController {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final int TOP = 5;
    // 이 기간 안의 기록만 본다. 연속 일수도 여기까지만 센다
    private static final int WINDOW_DAYS = 100;
    private static final int CACHE_SECONDS = 60;

    private record Streak(String visitorId, int streak, int days, boolean today) {}

    private record Board(List<Streak> ranked, Map<String, Integer> rankOf, LocalDate day, Instant at) {}

    private final UsageEventRepository usageEventRepository;
    private final VisitorProfileService profileService;

    private volatile Board cached;

    // 방문자 ID를 헤더로 주면 본인 순위도 함께 돌려준다
    @GetMapping("/rank/streak")
    public Map<String, Object> streak(@RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
        Board board = board();
        List<Streak> top = board.ranked().subList(0, Math.min(TOP, board.ranked().size()));
        Integer myRank = visitorId == null ? null : board.rankOf().get(visitorId);

        Set<String> ids = new HashSet<>();
        top.forEach(s -> ids.add(s.visitorId()));
        if (visitorId != null) ids.add(visitorId);
        Map<String, String> nicknames = profileService.nicknames(ids);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < top.size(); i++) {
            Streak s = top.get(i);
            Map<String, Object> row = row(s, i + 1, nicknames.get(s.visitorId()));
            row.put("me", s.visitorId().equals(visitorId));
            rows.add(row);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("top", rows);
        out.put("me", myRank == null ? null : row(board.ranked().get(myRank - 1), myRank, nicknames.get(visitorId)));
        out.put("nickname", visitorId == null ? null : nicknames.get(visitorId));
        return out;
    }

    // 순위에 나올 닉네임을 정한다. 채팅에서 쓰는 이름과 같은 것이다
    @PutMapping("/profile")
    public ResponseEntity<?> profile(@RequestBody Map<String, Object> body) {
        String visitorId = body.get("visitorId") instanceof String s && !s.isBlank() && s.length() <= 40 ? s.trim() : null;
        String nickname = VisitorProfileService.nickname(body.get("nickname"));
        if (visitorId == null || nickname == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "닉네임을 확인해 주세요."));
        }
        profileService.remember(visitorId, nickname);
        return ResponseEntity.ok(Map.of("nickname", nickname));
    }

    private static Map<String, Object> row(Streak s, int rank, String nickname) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("rank", rank);
        row.put("nickname", nickname);
        row.put("streak", s.streak());
        row.put("days", s.days());
        row.put("today", s.today());
        return row;
    }

    // 집계는 기록 전체를 훑으므로 잠깐 들고 있는다. 날짜가 바뀌면 바로 다시 센다
    private Board board() {
        LocalDate today = LocalDate.now(KST);
        Board board = cached;
        if (board != null && board.day().equals(today) && board.at().isAfter(Instant.now().minusSeconds(CACHE_SECONDS))) {
            return board;
        }

        Map<String, Set<LocalDate>> solved = new HashMap<>();
        usageEventRepository.solvedDaysSince(today.minusDays(WINDOW_DAYS - 1L))
                .forEach(r -> solved.computeIfAbsent((String) r[0], k -> new HashSet<>()).add((LocalDate) r[1]));

        List<Streak> ranked = new ArrayList<>();
        solved.forEach((visitorId, days) -> {
            // 오늘 아직 안 풀었어도 어제까지 이어졌으면 끊긴 것으로 보지 않는다
            boolean solvedToday = days.contains(today);
            int streak = 0;
            for (LocalDate d = solvedToday ? today : today.minusDays(1); days.contains(d); d = d.minusDays(1)) streak++;
            if (streak > 0) ranked.add(new Streak(visitorId, streak, days.size(), solvedToday));
        });
        ranked.sort(Comparator.comparingInt(Streak::streak).reversed()
                .thenComparing(Comparator.comparingInt(Streak::days).reversed())
                .thenComparing(s -> !s.today())
                .thenComparing(Streak::visitorId));

        Map<String, Integer> rankOf = new HashMap<>();
        for (int i = 0; i < ranked.size(); i++) rankOf.put(ranked.get(i).visitorId(), i + 1);
        board = new Board(ranked, rankOf, today, Instant.now());
        cached = board;
        return board;
    }
}
