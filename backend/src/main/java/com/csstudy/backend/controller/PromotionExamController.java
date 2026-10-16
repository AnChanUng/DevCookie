package com.csstudy.backend.controller;
import com.csstudy.backend.service.PromotionExamService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/v1/promotion-exams") @RequiredArgsConstructor
public class PromotionExamController {
    private final PromotionExamService exams;
    public record Submission(Map<String,Integer> answers) {}
    @PostMapping public ResponseEntity<?> start(HttpServletRequest request) throws Exception {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(exams.start(request));
    }
    @GetMapping("/{id}") public ResponseEntity<?> get(@PathVariable String id,HttpServletRequest request) throws Exception {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(exams.get(id,request));
    }
    @PostMapping("/{id}/submit") public ResponseEntity<?> submit(@PathVariable String id,@RequestBody Submission body,HttpServletRequest request) throws Exception {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(exams.submit(id,body.answers(),request));
    }
}
