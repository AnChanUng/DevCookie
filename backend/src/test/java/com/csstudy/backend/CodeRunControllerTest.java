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

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "app.admin-key=test-admin-key")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CodeRunControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private static final String MAIN = """
            import java.util.*;
            import java.util.function.*;
            public class Main {
                static String show(Object o) { String s = Arrays.deepToString(new Object[]{o}); return s.substring(1, s.length() - 1); }
                static void check(int no, Object expected, Supplier<Object> run) {
                    String e = show(expected);
                    try { String g = show(run.get()); System.out.println("@@CASE " + no + (e.equals(g) ? " PASS " : " FAIL ") + e + " @@GOT " + g); }
                    catch (Throwable t) { System.out.println("@@CASE " + no + " ERROR " + e + " @@GOT " + t); }
                }
                public static void main(String[] args) {
                    check(1, 6, () -> new Solution().solution(new int[]{1, 2, 3}));
                }
            }
            """;

    private String body(Map<String, String> files) throws Exception {
        return json.writeValueAsString(Map.of("files", files));
    }

    @Test
    void gradesASubmission() throws Exception {
        String solution = "class Solution { public int solution(int[] a) { int s = 0; for (int x : a) s += x; return s; } }";
        mvc.perform(post("/api/v1/code/java").contentType(MediaType.APPLICATION_JSON)
                        .header("X-Forwarded-For", "10.9.0.1")
                        .content(body(Map.of("Solution.java", solution, "Main.java", MAIN))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.stdout").value(containsString("@@CASE 1 PASS 6 @@GOT 6")));
    }

    @Test
    void rejectsBadRequests() throws Exception {
        mvc.perform(post("/api/v1/code/java").contentType(MediaType.APPLICATION_JSON)
                        .content(body(Map.of("../evil.java", "x", "Main.java", MAIN))))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/code/java").contentType(MediaType.APPLICATION_JSON)
                        .content(body(Map.of("Solution.java", "class Solution {}"))))
                .andExpect(status().isBadRequest());
    }
}
