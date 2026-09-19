package com.csstudy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.admin-key=test-admin-key")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QuestionReportTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private Map<String, Object> body(String visitor, String questionId, String kind) {
        Map<String, Object> body = new HashMap<>();
        body.put("visitorId", visitor);
        body.put("path", "/exam/hf");
        body.put("questionId", questionId);
        body.put("questionText", "다음 중 옳은 것은?");
        body.put("kind", kind);
        body.put("message", "3번도 정답으로 보입니다.");
        return body;
    }

    private void send(Map<String, Object> body, int status) throws Exception {
        mvc.perform(post("/api/v1/reports").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(body)))
                .andExpect(status().is(status));
    }

    @Test
    void badReportsAreRejected() throws Exception {
        send(body("visitor-r0", "q-bad", "nonsense"), 400);          // 모르는 종류
        Map<String, Object> noPath = body("visitor-r0", "q-bad", "typo");
        noPath.put("path", "relative");
        send(noPath, 400);                                            // 경로 형식이 아니다
    }

    @Test
    void reportsShowUpForTheAdminAndCanBeMarkedHandled() throws Exception {
        send(body("visitor-r1", "hf-report-1", "answer"), 200);

        // 같은 문제에 처리 안 된 제보가 이미 있으면 중복으로 보고 더 쌓지 않는다
        mvc.perform(post("/api/v1/reports").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(body("visitor-r2", "hf-report-1", "typo"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duplicate").value(true));

        String pick = "$.items[?(@.questionId == 'hf-report-1')]";
        String listed = mvc.perform(get("/api/v1/admin/reports").header("X-Admin-Key", "test-admin-key"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(pick + ".kind").value("answer"))
                .andExpect(jsonPath(pick + ".handled").value(false))
                .andExpect(jsonPath(pick + ".visitor").value("visitor-"))
                .andReturn().getResponse().getContentAsString();
        long id = json.readTree(listed).get("items").findValues("questionId").isEmpty() ? 0
                : json.readTree(listed).get("items").get(0).get("id").asLong();

        mvc.perform(post("/api/v1/admin/reports/" + id).header("X-Admin-Key", "test-admin-key")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"handled\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handled").value(true));
    }

    @Test
    void adminListNeedsTheKey() throws Exception {
        mvc.perform(get("/api/v1/admin/reports")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/admin/reports/1").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
