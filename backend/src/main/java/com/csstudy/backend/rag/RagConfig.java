package com.csstudy.backend.rag;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// app.rag.enabled=true(rag 프로필)일 때만 RAG 빈을 만든다. 운영 기본 설정에서는 아무것도 뜨지 않는다
@Configuration
@ConditionalOnProperty(name = "app.rag.enabled", havingValue = "true")
@EnableConfigurationProperties(RagProperties.class)
public class RagConfig {

    @Bean
    TeiReranker teiReranker(RagProperties props) {
        return new TeiReranker(props.rerankUrl(), props.finalK(), props.minRerankScore());
    }

    @Bean
    RagService ragService(VectorStore vectorStore, TeiReranker reranker, RagProperties props, ObjectProvider<ChatModel> chatModel) {
        return new RagService(vectorStore, reranker, props, chatModel);
    }

    @Bean
    RagIngestService ragIngestService(VectorStore vectorStore) {
        return new RagIngestService(vectorStore, new StudyNoteChunker());
    }
}
