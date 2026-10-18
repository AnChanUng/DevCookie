package com.csstudy.backend.controller;

import com.csstudy.backend.repository.UsageEventRepository;
import com.csstudy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.*;
import java.util.*;

/** Public aggregate counts only. Never return account or visitor records. */
@RestController
@RequiredArgsConstructor
public class PublicMetricsController {
    private final UsageEventRepository events;
    private final UserRepository users;

    @GetMapping("/api/v1/public/metrics")
    public Map<String, Object> metrics() {
        Instant now = Instant.now();
        LocalDate today = now.atZone(ZoneId.of("Asia/Seoul")).toLocalDate();
        LocalDate from = today.minusDays(29);
        List<Object[]> daily = events.publicDailyVisitors(from, today);
        long todayVisitors = 0, yesterdayVisitors = 0, peak = 0;
        for (Object[] row : daily) {
            long count = ((Number) row[1]).longValue();
            if (today.equals(row[0])) todayVisitors = count;
            if (today.minusDays(1).equals(row[0])) yesterdayVisitors = count;
            peak = Math.max(peak, count);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("asOf", now.toString());
        result.put("timezone", "Asia/Seoul");
        result.put("from", from.toString());
        result.put("through", today.toString());
        result.put("registeredAccounts", users.count());
        result.put("todayVisitors", todayVisitors);
        result.put("yesterdayVisitors", yesterdayVisitors);
        result.put("visitors30d", events.publicVisitors(from, today));
        result.put("pageViews30d", events.publicPageViews(from, today));
        result.put("totalPageViews", events.publicPageViews(LocalDate.of(2000, 1, 1), today));
        result.put("peakDailyVisitors30d", peak);
        result.put("totalExamCompletions", events.publicExamCompletions(today));
        result.put("visitorBasis", "anonymous_browser_id_page_view");
        return result;
    }
}
