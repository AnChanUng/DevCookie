package com.csstudy.backend.controller;

import com.csstudy.backend.dto.StatsResponse;
import com.csstudy.backend.service.AuthService;
import com.csstudy.backend.service.RedisService;
import com.csstudy.backend.service.UserProgressService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final RedisService redisService;
    private final AuthService authService;
    private final UserProgressService userProgressService;

    @GetMapping
    public ResponseEntity<StatsResponse> getStats(HttpServletRequest request) {
        StatsResponse cached = redisService.getStats();
        // 문제 수 집계는 캐시를 쓰고, 학습 완료 수만 로그인한 사용자 기준으로 채운다
        long studied = authService.currentUser(request).map(userProgressService::countStudied).orElse(0L);
        return ResponseEntity.ok(StatsResponse.builder()
                .totalQuestions(cached.getTotalQuestions())
                .studiedQuestions(studied)
                .byCategory(cached.getByCategory())
                .byDifficulty(cached.getByDifficulty())
                .build());
    }
}
