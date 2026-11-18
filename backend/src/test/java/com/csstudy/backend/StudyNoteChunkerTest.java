package com.csstudy.backend;

import com.csstudy.backend.rag.StudyNoteChunkerAccess;
import org.junit.jupiter.api.Test;
import org.springframework.ai.document.Document;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class StudyNoteChunkerTest {

    @Test
    void splitsBySectionAndKeepsTitleAndSource() {
        String md = "---\ntitle: \"데드락\"\ncategory: operating-system\n---\n\n## 질문\n데드락이란?\n\n## 답변\n" + "가".repeat(1500) + "\n\n짧은 문단\n";
        List<Document> docs = StudyNoteChunkerAccess.chunk("operating-system/09-deadlock.md", md);
        assertThat(docs).hasSizeGreaterThanOrEqualTo(3);
        assertThat(docs.get(0).getText()).startsWith("[데드락 · 질문]");
        assertThat(docs).allSatisfy(d -> {
            assertThat(d.getMetadata().get("source")).isEqualTo("operating-system/09-deadlock.md");
            assertThat(d.getText().length()).isLessThanOrEqualTo(1300);
        });
        // 같은 문서를 다시 나눠도 ID가 같아야 다시 넣을 때 덮어쓴다
        assertThat(StudyNoteChunkerAccess.chunk("operating-system/09-deadlock.md", md).get(1).getId()).isEqualTo(docs.get(1).getId());
    }

    @Test
    void loadsEveryStudyNoteFromTheClasspath() throws Exception {
        List<Document> docs = StudyNoteChunkerAccess.load();
        assertThat(docs.stream().map(d -> d.getMetadata().get("source")).distinct().count()).isEqualTo(109);
        assertThat(docs).anyMatch(d -> "spring/17-aop.md".equals(d.getMetadata().get("source")));
    }
}
