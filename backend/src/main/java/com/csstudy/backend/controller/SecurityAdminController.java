package com.csstudy.backend.controller;

import com.csstudy.backend.entity.SecurityEvent;
import com.csstudy.backend.repository.SecurityEventRepository;
import com.csstudy.backend.service.AdminAuth;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController @RequestMapping("/api/v1/admin/security") @RequiredArgsConstructor
public class SecurityAdminController {
    private final AdminAuth admins;
    private final SecurityEventRepository events;
    @GetMapping public List<SecurityEvent> recent(@RequestHeader(value="X-Admin-Key",required=false) String key) {
        admins.require(key);
        return events.findByOccurredAtGreaterThanEqualOrderByIdDesc(Instant.now().minus(7,ChronoUnit.DAYS),PageRequest.of(0,200));
    }
}
