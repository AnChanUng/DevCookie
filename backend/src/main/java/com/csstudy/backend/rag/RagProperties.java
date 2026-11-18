package com.csstudy.backend.rag;

import org.springframework.boot.context.properties.ConfigurationProperties;

// RAG 학습 도우미 설정 (application-rag.yml의 app.rag)
@ConfigurationProperties(prefix = "app.rag")
public record RagProperties(
        boolean enabled,
        String rerankUrl,
        // 1차 벡터 검색으로 가져올 후보 수
        int firstK,
        // 재정렬 뒤 답변 근거로 남길 수
        int finalK,
        // 재정렬 점수가 이보다 낮은 문서는 근거로 쓰지 않는다. 남는 문서가 없으면 답하지 않는다
        double minRerankScore
) {
    public RagProperties {
        if (firstK <= 0) firstK = 20;
        if (finalK <= 0) finalK = 5;
    }
}
