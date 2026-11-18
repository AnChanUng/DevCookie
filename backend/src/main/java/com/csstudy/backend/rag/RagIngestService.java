package com.csstudy.backend.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

import java.io.IOException;
import java.util.List;

// 학습 문서를 나눠 임베딩한 뒤 ChromaDB에 넣는다. 조각 ID는 문서 경로와 순번으로 정해지므로
// 다시 실행하면 같은 ID를 지우고 새로 넣는다
public class RagIngestService {

    // TEI의 한 번 요청 최대 개수(max-client-batch-size 64)보다 작게 나눠 넣는다
    static final int BATCH = 32;

    private final VectorStore vectorStore;
    private final StudyNoteChunker chunker;

    public RagIngestService(VectorStore vectorStore, StudyNoteChunker chunker) {
        this.vectorStore = vectorStore;
        this.chunker = chunker;
    }

    public record Result(int documents, int chunks) {}

    public Result ingest() throws IOException {
        List<Document> chunks = chunker.load();
        for (int i = 0; i < chunks.size(); i += BATCH) {
            List<Document> batch = chunks.subList(i, Math.min(i + BATCH, chunks.size()));
            vectorStore.delete(batch.stream().map(Document::getId).toList());
            vectorStore.add(batch);
        }
        int documents = (int) chunks.stream().map(d -> d.getMetadata().get("source")).distinct().count();
        return new Result(documents, chunks.size());
    }
}
