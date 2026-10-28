package com.csstudy.backend.controller;
import com.csstudy.backend.service.MembershipService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Set;
import java.util.Map;

@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class MembershipController {
    private final MembershipService membership;
    private static final Set<String> NOTES=Set.of("ipe-written-summary.pdf","ipe-written-review.pdf","ipe-silgi-theory.pdf","sqld-concepts.pdf","bigdata-analyst-summary.pdf","adsp-summary.pdf");
    @GetMapping("/membership")
    public MembershipService.Membership membership(HttpServletRequest request) { return membership.current(request); }
    @GetMapping("/theory/notes/{file}")
    public ResponseEntity<?> note(@PathVariable String file) {
        if (!NOTES.contains(file)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.status(HttpStatus.GONE)
                .cacheControl(CacheControl.noStore())
                .body(Map.of("code", "THEORY_NOTES_UNAVAILABLE", "error", "요약노트 열람과 다운로드 제공을 일시 중단했습니다."));
    }
}
