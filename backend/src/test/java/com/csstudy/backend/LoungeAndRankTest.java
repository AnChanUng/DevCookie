package com.csstudy.backend;

import com.csstudy.backend.entity.UsageEvent;
import com.csstudy.backend.repository.UsageEventRepository;
import com.csstudy.backend.service.VisitorProfileService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.admin-key=test-admin-key")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LoungeAndRankTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UsageEventRepository usageEventRepository;

    // 한 사람이 연달아 보내면 막히므로, 테스트끼리 서로 다른 방문자와 IP를 쓴다
    private ResultActions say(String visitor, String nickname, String text, String ip) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("visitorId", visitor);
        body.put("nickname", nickname);
        body.put("text", text);
        return mvc.perform(post("/api/v1/lounge/messages").contentType(MediaType.APPLICATION_JSON)
                .header("X-Forwarded-For", ip)
                .content(json.writeValueAsString(body)));
    }

    private JsonNode messages(Long after) throws Exception {
        var request = get("/api/v1/lounge/messages");
        if (after != null) request = request.param("after", String.valueOf(after));
        return json.readTree(mvc.perform(request).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    // 접속자 수 자체는 UsageTrackingTest가 확인한다. 여기서는 채팅 조회에 그 숫자가 함께 오는지만 본다
    @Test
    void chatResponseCarriesTheOnlineCount() throws Exception {
        mvc.perform(get("/api/v1/lounge/messages")).andExpect(jsonPath("$.online").isNumber());
    }

    @Test
    void messagesAreSharedAndNewOnesComeAfterTheLastSeenId() throws Exception {
        say("lounge-visitor-a1", "하나", "  안녕하세요\n반갑습니다  ", "10.1.0.1")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("안녕하세요 반갑습니다"))   // 한 줄로 다듬는다
                .andExpect(jsonPath("$.visitor").value("lounge-v"));          // 방문자 ID는 앞 8자만 나간다
        JsonNode all = messages(null);
        long lastId = all.get("messages").get(all.get("messages").size() - 1).get("id").asLong();

        say("lounge-visitor-a2", "둘", "오늘 기업은행 풀어 보신 분?", "10.1.0.2").andExpect(status().isOk());

        JsonNode fresh = messages(lastId);
        org.junit.jupiter.api.Assertions.assertEquals(1, fresh.get("messages").size());
        org.junit.jupiter.api.Assertions.assertEquals("둘", fresh.get("messages").get(0).get("nickname").asText());
        org.junit.jupiter.api.Assertions.assertEquals(all.get("epoch").asLong(), fresh.get("epoch").asLong());
    }

    @Test
    void emptyTooLongAndTooFastMessagesAreRejected() throws Exception {
        say("lounge-visitor-b1", "하나", "   ", "10.1.1.1").andExpect(status().isBadRequest());
        say("lounge-visitor-b1", "  ", "내용", "10.1.1.1").andExpect(status().isBadRequest());
        say("lounge-visitor-b1", "하나", "가".repeat(201), "10.1.1.1").andExpect(status().isBadRequest());

        say("lounge-visitor-b1", "하나", "첫 번째", "10.1.1.1").andExpect(status().isOk());
        say("lounge-visitor-b1", "하나", "바로 또 보냄", "10.1.1.1").andExpect(status().isTooManyRequests());
    }

    @Test
    void adminCanDeleteAMessageAndOpenScreensAreToldToReload() throws Exception {
        String sent = say("lounge-visitor-c1", "도배", "지워질 글", "10.1.2.1")
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        long id = json.readTree(sent).get("id").asLong();
        long epoch = messages(null).get("epoch").asLong();

        mvc.perform(delete("/api/v1/admin/lounge/messages/" + id)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/lounge/messages")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/v1/admin/lounge/messages/" + id).header("X-Admin-Key", "test-admin-key"))
                .andExpect(status().isOk());
        mvc.perform(delete("/api/v1/admin/lounge/messages/" + id).header("X-Admin-Key", "test-admin-key"))
                .andExpect(status().isNotFound());

        JsonNode after = messages(null);
        org.junit.jupiter.api.Assertions.assertNotEquals(epoch, after.get("epoch").asLong());
        for (JsonNode m : after.get("messages")) {
            org.junit.jupiter.api.Assertions.assertNotEquals(id, m.get("id").asLong());
        }
    }

    private void solved(String visitor, LocalDate day) {
        usageEventRepository.save(UsageEvent.builder()
                .visitorId(visitor).type("exam").path("/exam/ibk").detail("exam")
                .day(day).createdAt(Instant.now()).build());
    }

    // 순위는 잠깐 캐시되므로 기록을 모두 넣은 뒤 한 번에 확인한다.
    // 다른 테스트가 오늘 풀이 수를 세므로 넣은 기록은 끝나고 지운다
    @Test
    void solvedRankCountsEverySolveSoFar() throws Exception {
        try {
            checkSolvedRank();
        } finally {
            usageEventRepository.deleteAll(usageEventRepository.findAll().stream()
                    .filter(e -> e.getVisitorId().startsWith("rank-visitor-")).toList());
        }
    }

    private void checkSolvedRank() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        // 하루에 여러 번 풀어도, 오래전에 풀었어도 모두 센다
        for (int i = 0; i < 8; i++) solved("rank-visitor-eight", today);
        for (int i = 0; i < 6; i++) solved("rank-visitor-six", today.minusDays(200 + i));
        solved("rank-visitor-one", today);

        mvc.perform(put("/api/v1/profile").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"visitorId\":\"rank-visitor-eight\",\"nickname\":\" 많이<b>푸는</b>사람 \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("많이b푸는/b사람"));
        mvc.perform(put("/api/v1/profile").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"visitorId\":\"rank-visitor-eight\",\"nickname\":\"  \"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/v1/rank/solved").header("X-Visitor-Id", "rank-visitor-six"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.top[0].count").value(8))
                .andExpect(jsonPath("$.top[0].nickname").value("많이b푸는/b사람"))
                .andExpect(jsonPath("$.top[0].me").value(false))
                .andExpect(jsonPath("$.top[1].count").value(6))
                .andExpect(jsonPath("$.top[1].me").value(true))
                // 닉네임을 정하지 않았으면 익명 닉네임이 붙는다
                .andExpect(jsonPath("$.top[1].nickname").value(VisitorProfileService.anonymous("rank-visitor-six")))
                .andExpect(jsonPath("$.nickname").doesNotExist())
                .andExpect(jsonPath("$.me.rank").value(2))
                .andExpect(jsonPath("$.me.count").value(6));

        mvc.perform(get("/api/v1/rank/solved").header("X-Visitor-Id", "rank-visitor-none"))
                .andExpect(jsonPath("$.me").doesNotExist());
        mvc.perform(get("/api/v1/rank/solved")).andExpect(status().isOk()).andExpect(jsonPath("$.me").doesNotExist());
    }
}
