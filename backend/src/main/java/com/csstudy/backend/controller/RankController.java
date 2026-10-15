package com.csstudy.backend.controller;

import com.csstudy.backend.entity.User;
import com.csstudy.backend.entity.VisitorSolved;
import com.csstudy.backend.repository.UsageEventRepository;
import com.csstudy.backend.repository.UserRepository;
import com.csstudy.backend.repository.VisitorSolvedRepository;
import com.csstudy.backend.service.AuthService;
import com.csstudy.backend.service.VisitorProfileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

// 문제를 많이 푼 사람 순위. 같은 문제를 여러 번 풀어도 한 문제로 센다.
// 브라우저가 알려 준 문제 수(visitor_solved)를 쓰고, 아직 알려 주지 않은 방문자는 풀이 완료 기록(usage_events의 exam)으로 어림한다
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RankController {

    private static final int TOP = 5;
    private static final int CACHE_SECONDS = 60;
    // 사이트의 문제를 다 풀어도 넘지 못할 값. 터무니없는 숫자가 순위에 오르지 않게 막는다
    private static final int MAX_SOLVED = 3000;

    // account: 동기화 계정으로 묶인 줄이면 그 계정의 닉네임, 아니면 null
    private record Solver(String visitorId, long count, String account) {}

    private record Board(List<Solver> ranked, Map<String, Integer> rankOf, Instant at) {}

    private final UsageEventRepository usageEventRepository;
    private final VisitorSolvedRepository solvedRepository;
    private final VisitorProfileService profileService;
    private final UserRepository userRepository;
    private final AuthService authService;

    private volatile Board cached;

    // 방문자 ID를 헤더로 주면 본인 순위도 함께 돌려준다
    @GetMapping("/rank/solved")
    public Map<String, Object> solved(@RequestHeader(value = "X-Visitor-Id", required = false) String visitorId,
                                      @RequestParam(defaultValue = "false") boolean all,
                                      HttpServletRequest request) {
        // 로그인한 기기가 순위를 볼 때도 계정에 묶는다. 문제 수를 알리는 요청을 놓쳤어도 여기서 합쳐진다
        if (visitorId != null) {
            authService.currentUser(request).map(User::getId).ifPresent(userId ->
                    solvedRepository.findByVisitorId(visitorId).filter(v -> !userId.equals(v.getUserId())).ifPresent(v -> {
                        v.setUserId(userId);
                        solvedRepository.save(v);
                        cached = null;
                    }));
        }
        Board board = board();
        List<Solver> top = all ? board.ranked() : board.ranked().subList(0, Math.min(TOP, board.ranked().size()));
        Integer myRank = visitorId == null ? null : board.rankOf().get(visitorId);

        Set<String> ids = new HashSet<>();
        top.forEach(s -> ids.add(s.visitorId()));
        if (visitorId != null) ids.add(visitorId);
        Map<String, String> nicknames = profileService.nicknames(ids);

        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 0; i < top.size(); i++) {
            Solver s = top.get(i);
            Map<String, Object> row = row(s, i + 1, nicknames.get(s.visitorId()));
            row.put("me", myRank != null && myRank == i + 1);
            rows.add(row);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("top", rows);
        out.put("totalSolved", board.ranked().stream().mapToLong(Solver::count).sum());
        out.put("totalSolvers", board.ranked().size());
        Solver mine = myRank == null ? null : board.ranked().get(myRank - 1);
        out.put("me", mine == null ? null : row(mine, myRank, nicknames.get(visitorId)));
        // 직접 정한 닉네임만 돌려준다. 정한 적이 없으면 null. 계정으로 묶인 기기는 계정 닉네임이 나간다
        out.put("nickname", mine != null && mine.account() != null ? mine.account() : visitorId == null ? null : nicknames.get(visitorId));
        out.put("account", mine != null && mine.account() != null);
        return out;
    }

    // 브라우저에 남은 풀이 기록에서 센 "한 번이라도 푼 문제 수"를 받아 둔다
    @PutMapping("/rank/solved")
    public ResponseEntity<?> report(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String visitorId = body.get("visitorId") instanceof String s && !s.isBlank() && s.length() <= 40 ? s.trim() : null;
        Integer count = body.get("count") instanceof Number n && n.intValue() >= 0 && n.intValue() <= MAX_SOLVED ? n.intValue() : null;
        if (visitorId == null || count == null) return ResponseEntity.badRequest().build();

        VisitorSolved solved = solvedRepository.findByVisitorId(visitorId)
                .orElseGet(() -> VisitorSolved.builder().visitorId(visitorId).count(-1).build());
        // 로그인한 기기면 계정에 묶어 둔다. 로그아웃한 뒤에도 같은 사람이므로 묶음은 그대로 둔다
        Long userId = authService.currentUser(request).map(User::getId).orElse(solved.getUserId());
        if (solved.getCount() != count || !Objects.equals(solved.getUserId(), userId)) {
            solved.setCount(count);
            solved.setUserId(userId);
            solved.setUpdatedAt(Instant.now());
            try {
                solvedRepository.save(solved);
                cached = null;   // 방금 알려 준 숫자가 바로 순위에 보이게 한다
            } catch (DataIntegrityViolationException e) {
                // 같은 방문자의 요청이 겹쳤다. 먼저 들어간 값을 그대로 둔다
            }
        }
        return ResponseEntity.ok(Map.of("count", count));
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
        row.put("nickname", s.account() != null ? s.account() : nickname != null ? nickname : VisitorProfileService.anonymous(s.visitorId()));
        row.put("count", s.count());
        return row;
    }

    // 집계는 기록 전체를 훑으므로 잠깐 들고 있는다
    private Board board() {
        Board board = cached;
        if (board != null && board.at().isAfter(Instant.now().minusSeconds(CACHE_SECONDS))) {
            return board;
        }

        // 풀이 완료 기록으로 어림한 값: 문제집마다 한 번씩만 센 문제 수를 방문자별로 더한다
        Map<String, Long> counts = new HashMap<>();
        usageEventRepository.solvedCounts().forEach(r -> counts.merge((String) r[0], ((Number) r[2]).longValue(), Long::sum));
        // 브라우저가 알려 준 값이 있으면 그것이 정확하므로 그 값을 쓴다
        // 같은 계정으로 로그인한 기기들은 한 줄로 합친다. 기기끼리 기록을 맞추므로 더하지 않고 가장 큰 값을 쓴다
        Map<Long, List<String>> devices = new HashMap<>();
        solvedRepository.findAll().forEach(v -> {
            counts.put(v.getVisitorId(), (long) v.getCount());
            if (v.getUserId() != null) devices.computeIfAbsent(v.getUserId(), k -> new ArrayList<>()).add(v.getVisitorId());
        });
        Map<Long, String> accounts = new HashMap<>();
        userRepository.findAllById(devices.keySet()).forEach(u -> accounts.put(u.getId(), u.getNickname()));

        List<Solver> ranked = new ArrayList<>();
        Map<String, Solver> solverOf = new HashMap<>();
        devices.forEach((userId, ids) -> {
            if (!accounts.containsKey(userId)) return;   // 지워진 계정의 기기는 따로 센다
            ids.sort(Comparator.naturalOrder());
            long best = ids.stream().mapToLong(counts::get).max().orElse(0);
            Solver s = new Solver(ids.get(0), best, accounts.get(userId));
            ids.forEach(id -> { solverOf.put(id, s); counts.remove(id); });
            if (best > 0) ranked.add(s);
        });
        counts.forEach((visitorId, count) -> {
            if (count <= 0) return;
            Solver s = new Solver(visitorId, count, null);
            solverOf.put(visitorId, s);
            ranked.add(s);
        });
        ranked.sort(Comparator.comparingLong(Solver::count).reversed().thenComparing(Solver::visitorId));

        Map<Solver, Integer> place = new IdentityHashMap<>();
        for (int i = 0; i < ranked.size(); i++) place.put(ranked.get(i), i + 1);
        Map<String, Integer> rankOf = new HashMap<>();
        solverOf.forEach((visitorId, s) -> { if (place.containsKey(s)) rankOf.put(visitorId, place.get(s)); });
        board = new Board(ranked, rankOf, Instant.now());
        cached = board;
        return board;
    }
}
