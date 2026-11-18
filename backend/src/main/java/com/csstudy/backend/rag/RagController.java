package com.csstudy.backend.rag;

import com.csstudy.backend.service.AdminAuth;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

// RAG 학습 도우미 API. rag 프로필에서만 등록된다
@RestController
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.rag.enabled", havingValue = "true")
public class RagController {

    private final RagService rag;
    private final RagIngestService ingest;
    private final AdminAuth adminAuth;

    @PostMapping("/api/v1/rag/ask")
    public ResponseEntity<?> ask(@RequestBody Map<String, Object> body) {
        if (!(body.get("question") instanceof String q) || q.isBlank() || q.length() > 500) {
            return ResponseEntity.badRequest().body(Map.of("error", "질문을 500자 안으로 입력해 주세요."));
        }
        if (!rag.canAnswer()) return ResponseEntity.status(503).body(Map.of("error", "답변 모델이 준비되지 않았습니다."));
        return ResponseEntity.ok(rag.ask(q.trim()));
    }

    // LLM 없이 근거만 찾는다(답변 모델이 없을 때 화면이 근거를 보여 주는 데 쓴다)
    @GetMapping("/api/v1/rag/search")
    public ResponseEntity<?> search(@RequestParam("q") String q) {
        if (q == null || q.isBlank() || q.length() > 500) return ResponseEntity.badRequest().body(Map.of("error", "질문을 500자 안으로 입력해 주세요."));
        return ResponseEntity.ok(rag.evidence(q.trim()));
    }

    // 학습 문서를 다시 넣는다(관리자 키 필요)
    @PostMapping("/api/v1/admin/rag/ingest")
    public RagIngestService.Result reindex(@RequestHeader(value = "X-Admin-Key", required = false) String key) throws IOException {
        adminAuth.require(key);
        return ingest.ingest();
    }
}
