package com.csstudy.backend.controller;

import com.csstudy.backend.dto.GradeRequest;
import com.csstudy.backend.dto.GradeResponse;
import com.csstudy.backend.dto.GradingStatsResponse;
import com.csstudy.backend.service.AuthService;
import com.csstudy.backend.service.GradingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GradingController {

    private final GradingService gradingService;
    private final AuthService authService;

    /**
     * 사용자의 답변을 채점합니다.
     */
    @PostMapping("/questions/{id}/grade")
    public ResponseEntity<GradeResponse> gradeAnswer(
            @PathVariable Long id,
            @Valid @RequestBody GradeRequest request,
            HttpServletRequest httpRequest) {
        GradeResponse response = gradingService.gradeAnswer(id, request.getUserAnswer(),
                authService.currentUser(httpRequest).orElse(null));
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 문제의 과거 답변 목록을 조회합니다.
     */
    @GetMapping("/questions/{id}/answers")
    public ResponseEntity<List<GradeResponse>> getAnswers(@PathVariable Long id, HttpServletRequest request) {
        List<GradeResponse> answers = gradingService.getAnswersForQuestion(id, authService.requireUser(request));
        return ResponseEntity.ok(answers);
    }

    /**
     * 로그인한 사용자의 채점 통계를 조회합니다.
     */
    @GetMapping("/grading/stats")
    public ResponseEntity<GradingStatsResponse> getStats(HttpServletRequest request) {
        GradingStatsResponse stats = authService.currentUser(request)
                .map(gradingService::getStats)
                .orElseGet(gradingService::emptyStats);
        return ResponseEntity.ok(stats);
    }
}
