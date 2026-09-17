package com.csstudy.backend.controller;

import com.csstudy.backend.entity.ExamProgress;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.ExamProgressRepository;
import com.csstudy.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/exam")
@RequiredArgsConstructor
public class ExamController {

    private static final int MAX_DATA_LENGTH = 200_000;

    private final ExamProgressRepository examProgressRepository;
    private final AuthService authService;

    @GetMapping("/progress/{company}")
    public ResponseEntity<?> getProgress(@PathVariable String company, HttpServletRequest request) {
        User user = authService.requireUser(request);
        Map<String, Object> body = new HashMap<>();
        body.put("company", company);
        Optional<ExamProgress> progress = examProgressRepository.findByUserIdAndCompany(user.getId(), company);
        body.put("data", progress.map(ExamProgress::getData).orElse(null));
        body.put("updatedAt", progress.map(ExamProgress::getUpdatedAt).orElse(null));
        return ResponseEntity.ok(body);
    }

    @PutMapping("/progress/{company}")
    public ResponseEntity<?> saveProgress(@PathVariable String company, @RequestBody Map<String, Object> body,
                                          HttpServletRequest request) {
        User user = authService.requireUser(request);
        if (!(body.get("data") instanceof String data)) {
            return ResponseEntity.badRequest().body(Map.of("error", "data가 필요합니다."));
        }
        if (data.length() > MAX_DATA_LENGTH) {
            return ResponseEntity.badRequest().body(Map.of("error", "저장 데이터가 너무 큽니다."));
        }

        ExamProgress progress = examProgressRepository.findByUserIdAndCompany(user.getId(), company)
                .orElseGet(() -> ExamProgress.builder().user(user).company(company).build());
        progress.setData(data);
        ExamProgress saved = examProgressRepository.save(progress);

        return ResponseEntity.ok(Map.of("company", company, "updatedAt", saved.getUpdatedAt()));
    }
}
