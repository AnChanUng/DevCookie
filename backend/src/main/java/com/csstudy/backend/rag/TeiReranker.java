package com.csstudy.backend.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.rag.Query;
import org.springframework.ai.rag.postretrieval.document.DocumentPostProcessor;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// 2단계 재정렬. 1차 벡터 검색 후보를 cross-encoder(bge-reranker-v2-m3, TEI /rerank)로 질문과 한 쌍씩 다시 채점해
// 점수가 높은 순으로 finalK개만 남긴다. minScore보다 낮은 문서는 근거로 쓰지 않는다
public class TeiReranker implements DocumentPostProcessor {

    record Ranked(int index, double score) {}

    private final RestClient http;
    private final int finalK;
    private final double minScore;

    public TeiReranker(String baseUrl, int finalK, double minScore) {
        this.http = RestClient.builder().baseUrl(baseUrl).build();
        this.finalK = finalK;
        this.minScore = minScore;
    }

    @Override
    public List<Document> process(Query query, List<Document> documents) {
        return rerank(query.text(), documents, finalK, minScore);
    }

    // 점수를 Document.score와 metadata.rerank_score에 담아 돌려준다
    public List<Document> rerank(String question, List<Document> documents, int keep, double threshold) {
        if (documents.isEmpty()) return List.of();
        List<String> texts = documents.stream().map(Document::getText).toList();
        Ranked[] ranked = http.post().uri("/rerank")
                .body(Map.of("query", question, "texts", texts, "raw_scores", false, "truncate", true))
                .retrieve().body(Ranked[].class);
        List<Document> out = new ArrayList<>();
        if (ranked == null) return out;
        java.util.Arrays.sort(ranked, java.util.Comparator.comparingDouble(Ranked::score).reversed());
        for (Ranked r : ranked) {
            if (out.size() >= keep) break;
            if (r.score() < threshold) continue;
            Document d = documents.get(r.index());
            Map<String, Object> meta = new java.util.LinkedHashMap<>(d.getMetadata());
            meta.put("rerank_score", r.score());
            out.add(d.mutate().score(r.score()).metadata(meta).build());
        }
        return out;
    }
}
