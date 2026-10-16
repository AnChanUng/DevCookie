package com.csstudy.backend.controller;
import com.csstudy.backend.service.MembershipService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Set;

@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
public class MembershipController {
    private final MembershipService membership;
    private static final Set<String> NOTES=Set.of("ipe-silgi-theory.pdf","sqld-concepts.pdf","bigdata-analyst-summary.pdf","adsp-summary.pdf");
    @GetMapping("/membership")
    public MembershipService.Membership membership(HttpServletRequest request) { return membership.current(request); }
    @GetMapping("/theory/notes/{file}")
    public ResponseEntity<ClassPathResource> note(@PathVariable String file, HttpServletRequest request) {
        membership.requireGold(request);
        if (!NOTES.contains(file)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION,"inline; filename=\""+file+"\"")
                .body(new ClassPathResource("private-notes/"+file));
    }
}
