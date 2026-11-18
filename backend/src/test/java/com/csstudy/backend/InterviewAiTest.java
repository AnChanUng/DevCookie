package com.csstudy.backend;

import com.csstudy.backend.service.InterviewAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import java.nio.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

public class InterviewAiTest {
    final ObjectMapper json = new ObjectMapper();
    byte[] wav() {
        var b = ByteBuffer.allocate(32044).order(ByteOrder.LITTLE_ENDIAN);
        b.put("RIFF".getBytes()).putInt(32036).put("WAVEfmt ".getBytes()).putInt(16);
        b.putShort((short)1).putShort((short)1).putInt(16000).putInt(32000).putShort((short)2).putShort((short)16);
        b.put("data".getBytes()).putInt(32000); return b.array();
    }
    String response(String body) throws Exception {
        return json.writeValueAsString(Map.of("candidates", List.of(Map.of("finishReason", "STOP", "content", Map.of("parts", List.of(Map.of("text",body)))))));
    }
    @Test public void rejectsMalformedAndOversizeAudio() {
        assertDoesNotThrow(() -> InterviewAiService.validateWav(wav()));
        byte[] bad = wav(); bad[0] = 0;
        assertThrows(ResponseStatusException.class, () -> InterviewAiService.validateWav(bad));
        assertThrows(ResponseStatusException.class, () -> InterviewAiService.validateWav(new byte[5760045]));
        assertThrows(ResponseStatusException.class, () -> InterviewAiService.validateWav(new byte[44]));
    }
    @Test public void disabledServiceAndUnknownQuestionFailClearly() throws Exception {
        var ai = new InterviewAiService(json, "", "gemini-2.5-flash");
        assertFalse(ai.available());
        assertEquals(503, assertThrows(ResponseStatusException.class, () -> ai.transcribe(1, wav())).getStatusCode().value());
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> ai.grade(1, "forged", "hello")).getStatusCode().value());
    }
    @Test public void transcribesWithoutReferenceAnswerAndHandlesBlank() throws Exception {
        var ai = new InterviewAiService(json, "test-key", "gemini-2.5-flash");
        var server = MockRestServiceServer.createServer((RestTemplate)ReflectionTestUtils.getField(ai, "http"));
        server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"))
            .andExpect(header("x-goog-api-key", "test-key")).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("0.85"))))
            .andRespond(withSuccess(response("{\"transcript\":\"RAG는 검색 증강 생성입니다.\"}"), MediaType.APPLICATION_JSON));
        assertEquals("RAG는 검색 증강 생성입니다.", ai.transcribe(1, wav())); server.verify(); server.reset();
        server.expect(anything()).andRespond(withSuccess(response("{\"transcript\":\"\"}"), MediaType.APPLICATION_JSON));
        assertEquals(422, assertThrows(ResponseStatusException.class, () -> ai.transcribe(2, wav())).getStatusCode().value());
        server.verify();
    }
    @Test public void gradeUsesCanonicalQuestionAndServerSum() throws Exception {
        var ai = new InterviewAiService(json, "test", "gemini-2.5-flash");
        var server = MockRestServiceServer.createServer((RestTemplate)ReflectionTestUtils.getField(ai, "http"));
        String grade = "{\"relevance\":35,\"accuracy\":25,\"structure\":15,\"clarity\":8,\"total\":999,\"feedback\":\"근거\",\"strengths\":\"장점\",\"improvements\":\"보완\",\"example\":\"예시\"}";
        server.expect(anything()).andExpect(content().string(org.hamcrest.Matchers.containsString("검색 증강 생성")))
            .andRespond(withSuccess(response(grade), MediaType.APPLICATION_JSON));
        assertEquals(83, ai.grade(3, "cu-rag", "관련 정보를 검색합니다").get("total")); server.verify();
        assertEquals(429, assertThrows(ResponseStatusException.class, () -> ai.grade(3,"cu-rag","같은 요청")).getStatusCode().value());
        assertThrows(ResponseStatusException.class, () -> InterviewAiService.validatedGrade(json.readTree(grade.replace("35", "99"))));
    }
    @Test public void providerFailuresDoNotExposeSecrets() throws Exception {
        var ai = new InterviewAiService(json, "secret", "gemini-2.5-flash");
        var server = MockRestServiceServer.createServer((RestTemplate)ReflectionTestUtils.getField(ai, "http"));
        server.expect(anything()).andRespond(withStatus(HttpStatus.FORBIDDEN).body("secret"));
        var ex = assertThrows(ResponseStatusException.class, () -> ai.grade(4,"cu-rag","검색"));
        assertEquals(502, ex.getStatusCode().value()); assertFalse(ex.getReason().contains("secret")); server.verify();
    }
}
