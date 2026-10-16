package com.csstudy.backend.controller;

import com.csstudy.backend.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/profile") @RequiredArgsConstructor
public class PersonalBadgeController {
    private final AuthService auth;
    private final CohortService cohorts;

    @GetMapping("/badges")
    public ResponseEntity<List<CohortService.Badge>> badges(HttpServletRequest request) {
        // Resolve only the caller's identity. No target user/visitor query parameter is accepted.
        var user = request.getHeader("Authorization") == null ? auth.currentUser(request)
                : java.util.Optional.of(auth.requireUser(request));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(cohorts.badges(user.map(u -> u.getId()).orElse(null), request.getHeader("X-Visitor-Id")));
    }
}
