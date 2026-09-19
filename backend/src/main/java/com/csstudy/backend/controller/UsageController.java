package com.csstudy.backend.controller;

import com.csstudy.backend.entity.UsageEvent;
import com.csstudy.backend.repository.UsageEventRepository;
import com.csstudy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UsageController {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final Set<String> TYPES = Set.of("view", "exam");
    private static final int MAX_DAYS = 90;

    private final UsageEventRepository usageEventRepository;
    private final UserRepository userRepository;

    @Value("${app.admin-key:}")
    private String adminKey;

    // 누구나 호출하는 기록용 엔드포인트. 형식이 맞지 않으면 조용히 버린다
    @PostMapping("/track")
    public ResponseEntity<?> track(@RequestBody Map<String, Object> body) {
        String visitorId = str(body.get("visitorId"), 40);
        String type = str(body.get("type"), 16);
        String path = str(body.get("path"), 200);
        if (visitorId == null || path == null || !path.startsWith("/") || !TYPES.contains(type)) {
            return ResponseEntity.noContent().build();
        }
        Instant now = Instant.now();
        usageEventRepository.save(UsageEvent.builder()
                .visitorId(visitorId)
                .type(type)
                .path(path)
                .detail(str(body.get("detail"), 60))
                .day(now.atZone(KST).toLocalDate())
                .createdAt(now)
                .build());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/usage")
    public ResponseEntity<?> usage(@RequestHeader(value = "X-Admin-Key", required = false) String key,
                                   @RequestParam(defaultValue = "30") int days) {
        requireAdmin(key);
        int range = Math.max(1, Math.min(days, MAX_DAYS));
        LocalDate today = LocalDate.now(KST);
        LocalDate from = today.minusDays(range - 1L);

        Map<LocalDate, Object[]> views = new HashMap<>();
        usageEventRepository.dailySince("view", from).forEach(r -> views.put((LocalDate) r[0], r));
        Map<LocalDate, Object[]> exams = new HashMap<>();
        usageEventRepository.dailySince("exam", from).forEach(r -> exams.put((LocalDate) r[0], r));

        List<Map<String, Object>> daily = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
            Object[] v = views.get(d);
            Object[] e = exams.get(d);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("day", d.toString());
            row.put("views", v == null ? 0 : v[1]);
            row.put("visitors", v == null ? 0 : v[2]);
            row.put("exams", e == null ? 0 : e[1]);
            daily.add(row);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("days", range);
        body.put("today", summary(today));
        body.put("week", summary(today.minusDays(6)));
        body.put("range", summary(from));
        body.put("all", summary(LocalDate.of(2000, 1, 1)));
        body.put("users", userRepository.count());
        body.put("daily", daily);
        body.put("pages", paths("view", from, 20));
        body.put("exams", paths("exam", from, 30));
        body.put("recent", usageEventRepository.findByOrderByIdDesc(PageRequest.of(0, 30)).stream().map(e -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("at", e.getCreatedAt().toString());
            row.put("visitor", e.getVisitorId().substring(0, Math.min(8, e.getVisitorId().length())));
            row.put("type", e.getType());
            row.put("path", e.getPath());
            row.put("detail", e.getDetail());
            return row;
        }).toList());
        return ResponseEntity.ok(body);
    }

    private Map<String, Object> summary(LocalDate from) {
        Object[] v = usageEventRepository.totalsSince("view", from).get(0);
        Object[] e = usageEventRepository.totalsSince("exam", from).get(0);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("views", v[0]);
        m.put("visitors", v[1]);
        m.put("exams", e[0]);
        return m;
    }

    private List<Map<String, Object>> paths(String type, LocalDate from, int limit) {
        return usageEventRepository.byPathSince(type, from, PageRequest.of(0, limit)).stream().map(r -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("path", r[0]);
            row.put("count", r[1]);
            row.put("visitors", r[2]);
            return row;
        }).toList();
    }

    // ADMIN_KEY 환경변수를 설정하지 않은 서버에서는 관리자 조회가 아예 열리지 않는다
    private void requireAdmin(String key) {
        if (adminKey == null || adminKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ADMIN_KEY가 설정되지 않았습니다.");
        }
        if (key == null || !MessageDigest.isEqual(
                key.getBytes(StandardCharsets.UTF_8), adminKey.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 키가 올바르지 않습니다.");
        }
    }

    private static String str(Object value, int max) {
        if (!(value instanceof String s)) return null;
        String t = s.trim();
        if (t.isEmpty()) return null;
        return t.length() > max ? t.substring(0, max) : t;
    }
}
