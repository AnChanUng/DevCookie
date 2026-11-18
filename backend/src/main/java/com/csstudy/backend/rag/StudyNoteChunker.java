package com.csstudy.backend.rag;

import org.springframework.ai.document.Document;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// 전공 학습 문서(content/**/*.md)를 검색 단위로 나눈다. 문서마다 앞머리(title · category)를 읽고,
// 본문은 "## " 제목 단위로 자른다. 너무 긴 단락은 문단 경계에서 다시 나눈다.
// 조각마다 문서 제목을 붙여 두어, 단락만 떼어 봐도 무엇에 대한 설명인지 알 수 있게 한다.
public class StudyNoteChunker {

    static final int MAX_CHARS = 1200;

    public List<Document> load() throws IOException {
        Resource[] files = new PathMatchingResourcePatternResolver().getResources("classpath*:content/**/*.md");
        List<Resource> sorted = new ArrayList<>(List.of(files));
        sorted.sort(Comparator.comparing(StudyNoteChunker::source));
        List<Document> out = new ArrayList<>();
        for (Resource file : sorted) {
            try (InputStream in = file.getInputStream()) {
                out.addAll(chunk(source(file), new String(in.readAllBytes(), StandardCharsets.UTF_8)));
            }
        }
        return out;
    }

    // content/ 아래 상대 경로. 평가셋의 정답 문서 표기와 같다(예: operating-system/01-what-is-os.md)
    static String source(Resource file) {
        try {
            String url = file.getURL().toString().replace('\\', '/');
            int at = url.lastIndexOf("/content/");
            return at < 0 ? file.getFilename() : url.substring(at + "/content/".length());
        } catch (IOException e) {
            return file.getFilename();
        }
    }

    static List<Document> chunk(String source, String markdown) {
        String text = markdown.replace("\r\n", "\n");
        Map<String, String> front = new LinkedHashMap<>();
        if (text.startsWith("---\n")) {
            int end = text.indexOf("\n---", 4);
            if (end > 0) {
                for (String line : text.substring(4, end).split("\n")) {
                    int colon = line.indexOf(':');
                    if (colon > 0) front.put(line.substring(0, colon).trim(), line.substring(colon + 1).trim().replaceAll("^\"|\"$", ""));
                }
                text = text.substring(text.indexOf('\n', end + 1) + 1);
            }
        }
        String title = front.getOrDefault("title", source);
        String category = front.getOrDefault("category", source.contains("/") ? source.substring(0, source.indexOf('/')) : "");

        List<String[]> sections = new ArrayList<>();
        String heading = "개요";
        StringBuilder body = new StringBuilder();
        for (String line : text.split("\n")) {
            if (line.startsWith("## ")) {
                if (!body.toString().isBlank()) sections.add(new String[]{heading, body.toString().trim()});
                heading = line.substring(3).trim();
                body.setLength(0);
            } else {
                body.append(line).append('\n');
            }
        }
        if (!body.toString().isBlank()) sections.add(new String[]{heading, body.toString().trim()});

        List<Document> out = new ArrayList<>();
        int index = 0;
        for (String[] section : sections) {
            for (String piece : split(section[1])) {
                Map<String, Object> meta = new LinkedHashMap<>();
                meta.put("source", source);
                meta.put("title", title);
                meta.put("category", category);
                meta.put("section", section[0]);
                meta.put("chunk", index);
                String id = UUID.nameUUIDFromBytes((source + "#" + index).getBytes(StandardCharsets.UTF_8)).toString();
                out.add(new Document(id, "[" + title + " · " + section[0] + "]\n" + piece, meta));
                index++;
            }
        }
        return out;
    }

    // 문단(빈 줄) 경계에서 MAX_CHARS 안쪽으로 묶는다. 문단 하나가 너무 길면 그대로 자른다
    static List<String> split(String body) {
        List<String> out = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String paragraph : body.split("\n\\s*\n")) {
            if (current.length() > 0 && current.length() + paragraph.length() + 2 > MAX_CHARS) {
                out.add(current.toString().trim());
                current.setLength(0);
            }
            while (paragraph.length() > MAX_CHARS) {
                out.add(paragraph.substring(0, MAX_CHARS));
                paragraph = paragraph.substring(MAX_CHARS);
            }
            current.append(paragraph).append("\n\n");
        }
        if (!current.toString().isBlank()) out.add(current.toString().trim());
        return out;
    }
}
