package com.csstudy.backend;

import com.csstudy.backend.entity.UsageEvent;
import com.csstudy.backend.repository.UsageEventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.admin-key=")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PublicMetricsTest {
    @Autowired MockMvc mvc;
    @Autowired UsageEventRepository events;

    private void event(String visitor, String type, String path, LocalDate day) {
        events.save(UsageEvent.builder().visitorId(visitor).type(type).path(path)
                .day(day).createdAt(day.atStartOfDay(ZoneId.of("Asia/Seoul")).toInstant()).build());
    }

    @Test void aggregatesWithoutKeyDeduplicateAndRespectWindowWithoutExposingRecords() throws Exception {
        events.deleteAll();
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        event("a", "view", "/", today);
        event("a", "view", "/exam", today);
        event("a", "view", "/", today.minusDays(1));
        event("b", "view", "/", today.minusDays(29));
        event("old", "view", "/", today.minusDays(30));
        event("future", "view", "/", today.plusDays(1));
        event("admin", "view", "/admin/cu", today);
        event("click", "click", "/", today);
        event("a", "exam", "/exam", today);
        mvc.perform(get("/api/v1/public/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.todayVisitors").value(1))
                .andExpect(jsonPath("$.yesterdayVisitors").value(1))
                .andExpect(jsonPath("$.visitors30d").value(2))
                .andExpect(jsonPath("$.peakDailyVisitors30d").value(1))
                .andExpect(jsonPath("$.totalExamCompletions").value(1))
                .andExpect(jsonPath("$.registeredAccounts").isNumber())
                .andExpect(jsonPath("$.timezone").value("Asia/Seoul"))
                .andExpect(jsonPath("$.length()").value(11))
                .andExpect(jsonPath("$.users").doesNotExist())
                .andExpect(jsonPath("$.visitors").doesNotExist());
        mvc.perform(get("/api/v1/admin/system")).andExpect(status().isServiceUnavailable());
        mvc.perform(get("/api/v1/admin/usage")).andExpect(status().isServiceUnavailable());
    }

    @Test void emptyEventsReturnZeroCounts() throws Exception {
        events.deleteAll();
        mvc.perform(get("/api/v1/public/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.visitors30d").value(0))
                .andExpect(jsonPath("$.peakDailyVisitors30d").value(0))
                .andExpect(jsonPath("$.totalExamCompletions").value(0));
    }
}
