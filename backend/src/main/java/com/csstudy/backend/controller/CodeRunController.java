package com.csstudy.backend.controller;

import com.csstudy.backend.service.JavaRunner;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

// 코딩 문제 채점. 프론트가 제출 코드(Solution.java)와 채점용 Main.java를 함께 보내면 컴파일 · 실행 결과를 돌려준다.
// 무엇을 맞았다고 볼지는 Main이 출력하는 줄로 프론트가 판단한다
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CodeRunController {

    private static final Pattern FILE_NAME = Pattern.compile("[A-Z][A-Za-z0-9_]{0,40}\\.java");
    private static final int MAX_FILES = 4;
    private static final int MAX_CHARS = 40_000;
    // 한 곳(IP)에서 1분에 보낼 수 있는 실행 요청 수
    private static final int PER_MINUTE = 15;

    private final JavaRunner runner;
    private final com.csstudy.backend.security.ClientAddress addresses;
    private final Map<String, Deque<Long>> recent = new ConcurrentHashMap<>();

    @PostMapping("/code/java")
    public ResponseEntity<?> run(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        if (!(body.get("files") instanceof Map<?, ?> raw) || raw.isEmpty() || raw.size() > MAX_FILES) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일 구성이 올바르지 않습니다."));
        }
        Map<String, String> files = new LinkedHashMap<>();
        int total = 0;
        for (Map.Entry<?, ?> e : raw.entrySet()) {
            if (!(e.getKey() instanceof String name) || !(e.getValue() instanceof String code) || !FILE_NAME.matcher(name).matches()) {
                return ResponseEntity.badRequest().body(Map.of("error", "파일 이름이 올바르지 않습니다."));
            }
            total += code.length();
            files.put(name, code);
        }
        if (total > MAX_CHARS) return ResponseEntity.badRequest().body(Map.of("error", "코드가 너무 깁니다."));
        if (!files.containsKey("Main.java")) return ResponseEntity.badRequest().body(Map.of("error", "Main.java가 필요합니다."));
        if (!allow(addresses.resolve(request))) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("error", "실행 요청이 너무 잦습니다. 1분 뒤에 다시 시도해 주세요."));
        }
        return ResponseEntity.ok(runner.run(files, "Main"));
    }

    private boolean allow(String ip) {
        long now = System.currentTimeMillis();
        Deque<Long> times = recent.computeIfAbsent(ip, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && now - times.peekFirst() > 60_000) times.pollFirst();
            if (times.size() >= PER_MINUTE) return false;
            times.addLast(now);
        }
        if (recent.size() > 10_000) recent.clear();
        return true;
    }

}
