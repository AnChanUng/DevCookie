package com.csstudy.backend.controller;

import com.csstudy.backend.entity.ExamProgress;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.ExamProgressRepository;
import com.csstudy.backend.service.AuthService;
import com.csstudy.backend.service.ExamProgressService;
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

    private static final int MAX_DATA_LENGTH = ExamProgressService.MAX_DATA_LENGTH;

    private final ExamProgressRepository examProgressRepository;
    private final AuthService authService;
    private final ExamProgressService progress;

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

    // 트랜잭션은 ExamProgressService 안에서 짧게 연다. 여기서 트랜잭션을 열면 같은 사용자의 잠금을 기다리는 동안
    // DB 커넥션을 쥐고 있게 되어, 로그인 직후 동기화가 몰리면 다른 요청이 커넥션을 얻지 못한다
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
        ExamProgressService.Saved result = progress.save(user.getId(), company, data);
        if (result.tooLarge()) {
            return ResponseEntity.badRequest().body(Map.of("error", "합친 기록이 너무 큽니다. 백업 후 문의해 주세요."));
        }
        ExamProgress saved = result.progress();
        return ResponseEntity.ok(Map.of("company", company, "updatedAt", saved.getUpdatedAt(), "data", saved.getData()));
    }
}
