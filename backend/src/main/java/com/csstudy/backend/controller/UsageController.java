package com.csstudy.backend.controller;

import com.csstudy.backend.entity.UsageEvent;
import com.csstudy.backend.repository.UsageEventRepository;
import com.csstudy.backend.repository.UserRepository;
import com.csstudy.backend.service.AdminAuth;
import com.csstudy.backend.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UsageController {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final Set<String> TYPES = Set.of("view", "exam", "click");
    private static final Set<String> DEVICES = Set.of("mobile", "desktop");
    private static final int MAX_DAYS = 90;
    private static final int ACTIVE_MINUTES = 5;
    private static final Instant STARTED_AT = Instant.now();

    private final UsageEventRepository usageEventRepository;
    private final UserRepository userRepository;
    private final AdminAuth adminAuth;
    private final PresenceService presenceService;

    // 누구나 호출하는 기록용 엔드포인트. 형식이 맞지 않으면 조용히 버린다
    @PostMapping("/track")
    public ResponseEntity<?> track(@RequestBody Map<String, Object> body) {
        String visitorId = str(body.get("visitorId"), 40);
        String type = str(body.get("type"), 16);
        String path = str(body.get("path"), 200);
        if (visitorId == null || path == null || !path.startsWith("/") || !TYPES.contains(type)) {
            return ResponseEntity.noContent().build();
        }
        // 점수는 맞힌 수가 문제 수를 넘지 않을 때만 받는다
        Integer total = num(body.get("total"), 1000);
        Integer score = num(body.get("score"), 1000);
        if (!"exam".equals(type) || total == null || score == null || total == 0 || score > total) {
            total = null;
            score = null;
        }
        String device = str(body.get("device"), 10);
        Instant now = Instant.now();
        usageEventRepository.save(UsageEvent.builder()
                .visitorId(visitorId)
                .type(type)
                .path(path)
                .detail(str(body.get("detail"), 60))
                .score(score)
                .total(total)
                .seconds(num(body.get("seconds"), 86400))
                .device(device != null && DEVICES.contains(device) ? device : null)
                .referrer(str(body.get("referrer"), 100))
                .day(now.atZone(KST).toLocalDate())
                .createdAt(now)
                .build());
        return ResponseEntity.noContent().build();
    }

    // 열어 둔 화면이 1분마다 호출한다. 최근에 신호를 보낸 방문자 수를 돌려준다
    @PostMapping("/presence")
    public Map<String, Object> presence(@RequestBody Map<String, Object> body) {
        presenceService.beat(str(body.get("visitorId"), 40));
        return Map.of("count", presenceService.count());
    }

    @GetMapping("/admin/usage")
    public ResponseEntity<?> usage(@RequestHeader(value = "X-Admin-Key", required = false) String key,
                                   @RequestParam(defaultValue = "30") int days) {
        adminAuth.require(key);
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
        body.put("active", usageEventRepository.activeSince(Instant.now().minusSeconds(ACTIVE_MINUTES * 60L)));
        body.put("studying", presenceService.count());
        body.put("newToday", usageEventRepository.newVisitorsOn(today));
        body.put("daily", daily);
        body.put("pages", paths("view", from, 20));
        body.put("exams", paths("exam", from, 30));
        body.put("scores", scores(from));
        body.put("solves", usageEventRepository.findByTypeOrderByIdDesc("exam", PageRequest.of(0, 100)).stream()
                .map(UsageController::eventRow).toList());
        body.put("visitors", visitors(from));
        body.put("clicks", clicks(from, today));
        body.put("hours", hours(from));
        body.put("devices", pairs(usageEventRepository.devicesSince(from), "device"));
        body.put("referrers", pairs(usageEventRepository.referrersSince(from, PageRequest.of(0, 15)), "referrer"));
        body.put("server", server());
        body.put("recent", usageEventRepository.findByOrderByIdDesc(PageRequest.of(0, 50)).stream()
                .map(UsageController::eventRow).toList());
        return ResponseEntity.ok(body);
    }

    private static Map<String, Object> eventRow(UsageEvent e) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("at", e.getCreatedAt().toString());
        row.put("visitor", shortId(e.getVisitorId()));
        row.put("type", e.getType());
        row.put("path", e.getPath());
        row.put("detail", e.getDetail());
        row.put("score", e.getScore());
        row.put("total", e.getTotal());
        row.put("seconds", e.getSeconds());
        row.put("device", e.getDevice());
        return row;
    }

    private List<Map<String, Object>> scores(LocalDate from) {
        return usageEventRepository.scoresByPathSince(from).stream().map(r -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("path", r[0]);
            row.put("detail", r[1]);
            row.put("count", r[2]);
            row.put("visitors", r[3]);
            row.put("avgPercent", round(r[4]));
            row.put("avgSeconds", round(r[5]));
            return row;
        }).toList();
    }

    // 홈의 멘탈 기르기 · 오늘의 운세 같은 코너 버튼을 누른 횟수. 경로가 코너, detail이 버튼이다
    private List<Map<String, Object>> clicks(LocalDate from, LocalDate today) {
        return usageEventRepository.clicks(from, today).stream().map(r -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("path", r[0]);
            row.put("detail", r[1]);
            row.put("today", r[2]);
            row.put("range", r[3]);
            row.put("all", r[4]);
            row.put("visitors", r[5]);
            return row;
        }).toList();
    }

    private List<Map<String, Object>> visitors(LocalDate from) {
        Map<Object, Object[]> solved = new HashMap<>();
        usageEventRepository.visitorScoresSince(from).forEach(r -> solved.put(r[0], r));
        return usageEventRepository.visitorsSince(from, PageRequest.of(0, 50)).stream().map(r -> {
            Object[] s = solved.get(r[0]);
            long exams = s == null ? 0 : ((Number) s[1]).longValue();
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("visitor", shortId((String) r[0]));
            row.put("views", ((Number) r[1]).longValue() - exams);
            row.put("exams", exams);
            row.put("avgPercent", s == null ? null : round(s[2]));
            row.put("firstAt", r[2].toString());
            row.put("lastAt", r[3].toString());
            return row;
        }).toList();
    }

    // 한국 시간 0~23시별 열람 수
    private int[] hours(LocalDate from) {
        int[] hours = new int[24];
        usageEventRepository.viewTimesSince(from).forEach(t -> hours[t.atZone(KST).getHour()]++);
        return hours;
    }

    private static List<Map<String, Object>> pairs(List<Object[]> rows, String name) {
        return rows.stream().map(r -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put(name, r[0]);
            row.put("count", r[1]);
            return row;
        }).toList();
    }

    private Map<String, Object> server() {
        Runtime rt = Runtime.getRuntime();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("uptimeSeconds", Instant.now().getEpochSecond() - STARTED_AT.getEpochSecond());
        m.put("events", usageEventRepository.count());
        m.put("memoryUsedMb", (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024));
        m.put("memoryMaxMb", rt.maxMemory() / (1024 * 1024));
        return m;
    }

    private static String shortId(String id) {
        return id.substring(0, Math.min(8, id.length()));
    }

    private static Long round(Object value) {
        return value == null ? null : Math.round(((Number) value).doubleValue());
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

    private static Integer num(Object value, int max) {
        if (!(value instanceof Number n)) return null;
        int v = n.intValue();
        return v < 0 || v > max ? null : v;
    }

    private static String str(Object value, int max) {
        if (!(value instanceof String s)) return null;
        String t = s.trim();
        if (t.isEmpty()) return null;
        return t.length() > max ? t.substring(0, max) : t;
    }
}
