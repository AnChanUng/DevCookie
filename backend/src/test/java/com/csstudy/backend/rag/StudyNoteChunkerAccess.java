package com.csstudy.backend.rag;

import org.springframework.ai.document.Document;

import java.io.IOException;
import java.util.List;

// 테스트에서 패키지 내부 메서드를 부르기 위한 통로
public final class StudyNoteChunkerAccess {
    private StudyNoteChunkerAccess() {}

    public static List<Document> chunk(String source, String markdown) {
        return StudyNoteChunker.chunk(source, markdown);
    }

    public static List<Document> load() throws IOException {
        return new StudyNoteChunker().load();
    }
}
