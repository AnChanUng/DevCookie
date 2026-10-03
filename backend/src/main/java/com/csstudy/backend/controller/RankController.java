package com.csstudy.backend.controller;

import com.csstudy.backend.repository.UsageEventRepository;
import com.csstudy.backend.service.VisitorProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

// 문제를 많이 푼 사람 순위. 풀이 완료 기록(usage_events의 exam)을 방문자별로 지금까지 모두 센다
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RankController {

    private static final int TOP = 5;
    private static final int CACHE_SECONDS = 60;

    private record Solver(String visitorId, long count) {}

    private record Board(List<Solver> ranked, Map<String, Integer> rankOf, Instant at) {}

    private final UsageEventRepository usageEventRepository;
    private final VisitorProfileService profileService;

    private volatile Board cached;

    // 방문자 ID를 헤더로 주면 본인 순위도 함께 돌려준다
    @GetMapping("/rank/solved")
    public Map<String, Object> solved(@RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {
        Board board = board();
        List<Solver> top = board.ranked().subList(0, Math.min(TOP, board.ranked().size()));
        Integer myRank = visitorId == null ? null : board.rankOf().get(visitorId);

        Set<String> ids = new HashSet<>();
        top.forEach(s -> ids.add(s.visitorId()));
        if (visitorId != null) ids.add(visitorId);
        Map<String, String> nicknames = profileService.nicknames(ids);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < top.size(); i++) {
            Solver s = top.get(i);
            Map<String, Object> row = row(s, i + 1, nicknames.get(s.visitorId()));
            row.put("me", s.visitorId().equals(visitorId));
            rows.add(row);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("top", rows);
        out.put("me", myRank == null ? null : row(board.ranked().get(myRank - 1), myRank, nicknames.get(visitorId)));
        // 직접 정한 닉네임만 돌려준다. 정한 적이 없으면 null
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

    // 닉네임을 정하지 않은 사람은 익명 닉네임으로 나간다
    private static Map<String, Object> row(Solver s, int rank, String nickname) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("rank", rank);
        row.put("nickname", nickname != null ? nickname : VisitorProfileService.anonymous(s.visitorId()));
        row.put("count", s.count());
        return row;
    }

    // 집계는 기록 전체를 훑으므로 잠깐 들고 있는다
    private Board board() {
        Board board = cached;
        if (board != null && board.at().isAfter(Instant.now().minusSeconds(CACHE_SECONDS))) {
            return board;
        }

        List<Solver> ranked = new ArrayList<>();
        usageEventRepository.solvedCounts().forEach(r -> ranked.add(new Solver((String) r[0], (Long) r[1])));

        Map<String, Integer> rankOf = new HashMap<>();
        for (int i = 0; i < ranked.size(); i++) rankOf.put(ranked.get(i).visitorId(), i + 1);
        board = new Board(ranked, rankOf, Instant.now());
        cached = board;
        return board;
    }
}
