package com.csstudy.backend;

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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DuelTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String create(List<String> ids) throws Exception {
        String body = mvc.perform(post("/api/v1/duels").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("questionIds", ids))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("code").asText();
    }

    private ResultActions report(String code, String visitor, String nickname, int score, int answered, boolean done, int seconds) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("visitorId", visitor);
        body.put("nickname", nickname);
        body.put("score", score);
        body.put("answered", answered);
        body.put("done", done);
        body.put("seconds", seconds);
        return mvc.perform(put("/api/v1/duels/" + code + "/players").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(body)));
    }

    @Test
    void roomKeepsTheQuestionListAndRanksPlayersByScoreThenTime() throws Exception {
        String code = create(List.of("kdb:d01", "kdb:d02", "comil:os01"));
        assertEquals(6, code.length());

        report(code, "v-slow", "느린 수달", 2, 3, true, 90).andExpect(status().isOk());
        report(code, "v-fast", "빠른 여우", 2, 3, true, 40).andExpect(status().isOk());
        report(code, "v-best", "잘하는 판다", 3, 3, true, 120).andExpect(status().isOk());

        JsonNode room = json.readTree(mvc.perform(get("/api/v1/duels/" + code.toLowerCase()).header("X-Visitor-Id", "v-fast"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        assertEquals(3, room.get("questionIds").size());
        assertEquals("comil:os01", room.get("questionIds").get(2).asText());
        JsonNode players = room.get("players");
        assertEquals("잘하는 판다", players.get(0).get("nickname").asText());
        assertEquals("빠른 여우", players.get(1).get("nickname").asText());
        assertEquals("느린 수달", players.get(2).get("nickname").asText());
        assertTrue(players.get(1).get("me").asBoolean());
    }

    @Test
    void progressIsOverwrittenUntilThePlayerFinishes() throws Exception {
        String code = create(List.of("a:1", "a:2", "a:3"));
        report(code, "v-1", "수달", 1, 1, false, 10).andExpect(jsonPath("$.players[0].answered").value(1));
        report(code, "v-1", "수달", 2, 3, true, 30).andExpect(jsonPath("$.players[0].score").value(2));
        // 끝낸 뒤에 다시 올린 점수는 받지 않는다
        report(code, "v-1", "수달", 3, 3, true, 5)
                .andExpect(jsonPath("$.players[0].score").value(2))
                .andExpect(jsonPath("$.players[0].seconds").value(30))
                .andExpect(jsonPath("$.players.length()").value(1));
    }

    @Test
    void badInputIsRejected() throws Exception {
        mvc.perform(post("/api/v1/duels").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("questionIds", List.of("only-one")))))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/duels/ZZZZZZ")).andExpect(status().isNotFound());

        String code = create(List.of("a:1", "a:2", "a:3"));
        // 맞힌 수가 답한 수보다 많거나 문제 수를 넘으면 받지 않는다
        report(code, "v-1", "수달", 3, 2, false, 10).andExpect(status().isBadRequest());
        report(code, "v-1", "수달", 4, 4, true, 10).andExpect(status().isBadRequest());
    }
}
