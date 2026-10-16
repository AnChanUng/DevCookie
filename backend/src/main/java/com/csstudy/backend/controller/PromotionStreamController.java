package com.csstudy.backend.controller;
import com.csstudy.backend.service.PromotionStreamService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class PromotionStreamController {
    private final PromotionStreamService stream;
    @GetMapping(value="/promotions/stream",produces=MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(HttpServletResponse response) {
        response.setHeader("Cache-Control","no-store");response.setHeader("X-Accel-Buffering","no");
        return stream.subscribe();
    }
}
