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

    @Test
    void enteringShowsWaitingPlayersAndCompletedGamesAppearInRecord() throws Exception {
        String code=create(List.of("a:1","a:2","a:3"));
        for (String visitor : List.of("waiting-a","waiting-b")) {
            mvc.perform(post("/api/v1/duels/"+code+"/join").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("visitorId",visitor,"nickname",visitor))))
                .andExpect(status().isOk());
        }
        mvc.perform(get("/api/v1/duels/"+code).header("X-Visitor-Id","waiting-a"))
            .andExpect(jsonPath("$.players.length()").value(2))
            .andExpect(jsonPath("$.players[0].started").value(false));
        report(code,"waiting-a","A",3,3,true,40).andExpect(status().isOk());
        mvc.perform(get("/api/v1/duels/record").header("X-Visitor-Id","waiting-a"))
            .andExpect(jsonPath("$.total").value(0));
        report(code,"waiting-b","B",2,3,true,20).andExpect(status().isOk());
        mvc.perform(get("/api/v1/duels/record").header("X-Visitor-Id","waiting-a"))
            .andExpect(jsonPath("$.wins").value(1)).andExpect(jsonPath("$.total").value(1));
        mvc.perform(get("/api/v1/duels/record").header("X-Visitor-Id","waiting-b"))
            .andExpect(jsonPath("$.losses").value(1));
        mvc.perform(post("/api/v1/duels/"+code+"/join").contentType(MediaType.APPLICATION_JSON)
            .content("{\"visitorId\":\"waiting-a\",\"nickname\":\"A\"}"))
            .andExpect(jsonPath("$.players[0].score").value(3));
        mvc.perform(post("/api/v1/duels/"+code+"/join").contentType(MediaType.APPLICATION_JSON)
            .content("{\"visitorId\":\"late-newcomer\",\"nickname\":\"late\"}"))
            .andExpect(status().isConflict());
    }

    @Test
    void identicalScoreAndTimeIsDrawAndDelayedProgressCannotRewind() throws Exception {
        String code=create(List.of("a:1","a:2","a:3"));
        report(code,"draw-a","A",2,2,false,20).andExpect(status().isOk());
        report(code,"draw-a","A",0,0,false,0).andExpect(jsonPath("$.players[0].answered").value(2));
        report(code,"draw-a","A",2,3,true,40).andExpect(status().isOk());
        report(code,"draw-b","B",2,3,true,40).andExpect(status().isOk());
        mvc.perform(get("/api/v1/duels/record").header("X-Visitor-Id","draw-a"))
            .andExpect(jsonPath("$.draws").value(1)).andExpect(jsonPath("$.wins").value(0));
    }

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
        // 테스트 정답표는 모두 0번이 정답이다. 앞에서부터 score개를 맞히고 나머지는 틀린 답을 고른다
        body.put("picks", "0".repeat(Math.max(0, Math.min(score, answered))) + "1".repeat(Math.max(0, answered - score)));
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
    void rematchOpensOneNextRoomForEveryone() throws Exception {
        String code = create(List.of("a:1", "a:2", "a:3"));
        String body = json.writeValueAsString(Map.of("questionIds", List.of("b:1", "b:2", "b:3")));
        String first = json.readTree(mvc.perform(post("/api/v1/duels/" + code + "/rematch").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("code").asText();
        // 두 번째로 누른 사람의 문제 목록은 버리고 먼저 열린 방으로 보낸다
        String other = json.writeValueAsString(Map.of("questionIds", List.of("c:1", "c:2", "c:3")));
        mvc.perform(post("/api/v1/duels/" + code + "/rematch").contentType(MediaType.APPLICATION_JSON).content(other))
                .andExpect(jsonPath("$.code").value(first));

        mvc.perform(get("/api/v1/duels/" + code)).andExpect(jsonPath("$.nextCode").value(first));
        mvc.perform(get("/api/v1/duels/" + first))
                .andExpect(jsonPath("$.questionIds[0]").value("b:1"))
                .andExpect(jsonPath("$.nextCode").doesNotExist());
    }

    @Test
    void perQuestionMarksAreShownOnlyToPlayersWhoFinished() throws Exception {
        String code = create(List.of("a:1", "a:2", "a:3"));
        Map<String, Object> done = new HashMap<>(Map.of("visitorId", "v-a", "nickname", "수달", "picks", "020", "answered", 3, "done", true, "seconds", 20));
        mvc.perform(put("/api/v1/duels/" + code + "/players").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(done)))
                .andExpect(jsonPath("$.players[0].marks").value("101"));
        Map<String, Object> playing = new HashMap<>(Map.of("visitorId", "v-b", "nickname", "여우", "picks", "0", "answered", 1, "done", false, "seconds", 5));
        mvc.perform(put("/api/v1/duels/" + code + "/players").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(playing)))
                .andExpect(status().isOk());

        // 아직 푸는 사람과 구경하는 사람에게는 남의 정오답을 가린다(본인 것은 보인다)
        mvc.perform(get("/api/v1/duels/" + code).header("X-Visitor-Id", "v-b"))
                .andExpect(jsonPath("$.players[0].marks").doesNotExist())
                .andExpect(jsonPath("$.players[1].marks").value("1"))
                .andExpect(jsonPath("$.players[1].picks").value("0"));
        mvc.perform(get("/api/v1/duels/" + code)).andExpect(jsonPath("$.players[0].marks").doesNotExist());
        mvc.perform(get("/api/v1/duels/" + code).header("X-Visitor-Id", "v-a")).andExpect(jsonPath("$.players[0].marks").value("101"));

        // 클라이언트가 점수와 정오답을 꾸며 보내도 서버가 고른 보기로 다시 채점한다
        Map<String, Object> forged = new HashMap<>(Map.of("visitorId", "v-c", "nickname", "판다", "picks", "123", "answered", 3, "done", true,
                "seconds", 9, "score", 3, "marks", "111"));
        mvc.perform(put("/api/v1/duels/" + code + "/players").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(forged)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/v1/duels/" + code).header("X-Visitor-Id", "v-c"))
                .andExpect(jsonPath("$.players[?(@.nickname == '판다')].score").value(0))
                .andExpect(jsonPath("$.players[?(@.nickname == '판다')].marks").value("000"));
        // 없는 보기를 고르면 받지 않는다
        Map<String, Object> invalid = new HashMap<>(Map.of("visitorId", "v-d", "nickname", "곰", "picks", "9", "answered", 1, "done", false, "seconds", 3));
        mvc.perform(put("/api/v1/duels/" + code + "/players").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void reportedTimeCannotGoBelowWhatTheServerObserved() throws Exception {
        String code = create(List.of("a:1", "a:2", "a:3"));
        report(code, "v-t", "거북", 1, 1, false, 50).andExpect(status().isOk());
        // 앞서 올린 시간보다 짧게 다시 올려도 줄어들지 않는다
        report(code, "v-t", "거북", 3, 3, true, 5).andExpect(jsonPath("$.players[0].seconds").value(50));
    }

    @Test
    void sameIdempotencyKeyReturnsTheSameRoom() throws Exception {
        String body = json.writeValueAsString(Map.of("questionIds", List.of("a:1", "a:2", "a:3")));
        String first = json.readTree(mvc.perform(post("/api/v1/duels").header("Idempotency-Key", "key-12345678")
                .contentType(MediaType.APPLICATION_JSON).content(body)).andReturn().getResponse().getContentAsString()).get("code").asText();
        mvc.perform(post("/api/v1/duels").header("Idempotency-Key", "key-12345678").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(jsonPath("$.code").value(first));
        mvc.perform(post("/api/v1/duels").header("Idempotency-Key", "bad key").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void openRoomsAreListedAndPrivateRoomsAreNot() throws Exception {
        String hidden = create(List.of("a:1", "a:2", "a:3"));
        Map<String, Object> body = new HashMap<>(Map.of("questionIds", List.of("b:1", "b:2", "b:3"), "open", true, "title", "데이터베이스"));
        String shown = json.readTree(mvc.perform(post("/api/v1/duels").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("code").asText();
        report(shown, "v-1", "수달", 0, 0, false, 0).andExpect(status().isOk());

        JsonNode rooms = json.readTree(mvc.perform(get("/api/v1/duels/open")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        boolean sawShown = false;
        for (JsonNode r : rooms) {
            assertTrue(!r.get("code").asText().equals(hidden));
            if (r.get("code").asText().equals(shown)) {
                sawShown = true;
                assertEquals("데이터베이스", r.get("title").asText());
                assertEquals(3, r.get("total").asInt());
                assertEquals(1, r.get("players").asInt());
            }
        }
        assertTrue(sawShown);
        mvc.perform(get("/api/v1/duels/" + shown)).andExpect(jsonPath("$.open").value(true));
        mvc.perform(get("/api/v1/duels/" + hidden)).andExpect(jsonPath("$.open").value(false));
    }

    @Test
    void badInputIsRejected() throws Exception {
        mvc.perform(post("/api/v1/duels").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("questionIds", List.of("only-one")))))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/duels/ZZZZZZ")).andExpect(status().isNotFound());

        // 서버 정답표에 없는 문제로는 방을 만들 수 없다
        mvc.perform(post("/api/v1/duels").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("questionIds", List.of("x:1", "x:2", "x:3")))))
                .andExpect(status().isBadRequest());

        String code = create(List.of("a:1", "a:2", "a:3"));
        // 문제 수보다 많이 답했거나, 답한 수와 고른 보기 수가 다르면 받지 않는다
        report(code, "v-1", "수달", 4, 4, true, 10).andExpect(status().isBadRequest());
        Map<String, Object> mismatch = new HashMap<>(Map.of("visitorId", "v-1", "nickname", "수달", "picks", "00", "answered", 3, "done", false, "seconds", 3));
        mvc.perform(put("/api/v1/duels/" + code + "/players").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(mismatch)))
                .andExpect(status().isBadRequest());
    }
}
