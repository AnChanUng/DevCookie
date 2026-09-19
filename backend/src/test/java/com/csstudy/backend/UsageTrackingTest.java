package com.csstudy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.admin-key=test-admin-key")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UsageTrackingTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private void track(String visitor, String type, String path, String detail) throws Exception {
        Map<String, String> body = new java.util.HashMap<>(Map.of("visitorId", visitor, "type", type, "path", path));
        if (detail != null) body.put("detail", detail);
        mvc.perform(post("/api/v1/track").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(body)))
                .andExpect(status().isNoContent());
    }

    @Test
    void adminUsageRequiresTheKey() throws Exception {
        mvc.perform(get("/api/v1/admin/usage")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/usage").header("X-Admin-Key", "wrong")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/usage").header("X-Admin-Key", "test-admin-key")).andExpect(status().isOk());
    }

    @Test
    void trackedEventsShowUpInTheSummary() throws Exception {
        track("visitor-a", "view", "/exam/hf", null);
        track("visitor-a", "view", "/exam/hf", null);
        track("visitor-b", "view", "/exam/hf", null);
        track("visitor-b", "exam", "/exam/hf", "exam");
        track("visitor-c", "bogus", "/exam/hf", null);   // 모르는 종류는 버린다
        track("visitor-c", "view", "no-slash", null);    // 경로 형식이 아니면 버린다

        mvc.perform(get("/api/v1/admin/usage").param("days", "7").header("X-Admin-Key", "test-admin-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.today.views").value(3))
                .andExpect(jsonPath("$.today.visitors").value(2))
                .andExpect(jsonPath("$.today.exams").value(1))
                .andExpect(jsonPath("$.daily.length()").value(7))
                .andExpect(jsonPath("$.daily[6].views").value(3))
                .andExpect(jsonPath("$.pages[0].path").value("/exam/hf"))
                .andExpect(jsonPath("$.pages[0].visitors").value(2))
                .andExpect(jsonPath("$.exams[0].count").value(1))
                .andExpect(jsonPath("$.recent[0].detail").value("exam"));
    }
}
