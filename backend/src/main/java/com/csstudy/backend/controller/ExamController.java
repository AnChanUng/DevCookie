package com.csstudy.backend.controller;

import com.csstudy.backend.entity.ExamProgress;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.ExamProgressRepository;
import com.csstudy.backend.repository.UserRepository;
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
    private final UserRepository userRepository;

    @GetMapping("/progress/{company}")
    public ResponseEntity<?> getProgress(@PathVariable String company, @RequestParam Long userId) {
        Map<String, Object> body = new HashMap<>();
        body.put("company", company);
        Optional<ExamProgress> progress = examProgressRepository.findByUserIdAndCompany(userId, company);
        body.put("data", progress.map(ExamProgress::getData).orElse(null));
        body.put("updatedAt", progress.map(ExamProgress::getUpdatedAt).orElse(null));
        return ResponseEntity.ok(body);
    }

    @PutMapping("/progress/{company}")
    public ResponseEntity<?> saveProgress(@PathVariable String company, @RequestBody Map<String, Object> body) {
        Object userIdRaw = body.get("userId");
        Object dataRaw = body.get("data");
        if (userIdRaw == null || !(dataRaw instanceof String data)) {
            return ResponseEntity.badRequest().body(Map.of("error", "userId와 data가 필요합니다."));
        }
        if (data.length() > MAX_DATA_LENGTH) {
            return ResponseEntity.badRequest().body(Map.of("error", "저장 데이터가 너무 큽니다."));
        }

        Long userId = Long.valueOf(String.valueOf(userIdRaw));
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "존재하지 않는 사용자입니다."));
        }

        ExamProgress progress = examProgressRepository.findByUserIdAndCompany(userId, company)
                .orElseGet(() -> ExamProgress.builder().user(userOpt.get()).company(company).build());
        progress.setData(data);
        ExamProgress saved = examProgressRepository.save(progress);

        return ResponseEntity.ok(Map.of("company", company, "updatedAt", saved.getUpdatedAt()));
    }
}
