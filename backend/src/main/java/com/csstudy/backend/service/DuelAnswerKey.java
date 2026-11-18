package com.csstudy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 대결 채점용 정답표. 프런트의 주제별 통합 문제집에서 뽑은 문제 번호 · 정답 번호 · 보기 수만 들고 있다
// (frontend/scripts/export-duel-bank.mjs로 만든다). 대결 점수는 클라이언트가 보낸 점수가 아니라 이 정답표로 계산한다.
@Component
public class DuelAnswerKey {

    public record Answer(String id, int a, int n) {}

    // 맞힌 수와 문제별 정오답("101")
    public record Graded(int score, String marks) {}

    private final Map<String, Answer> answers = new HashMap<>();

    public DuelAnswerKey(ObjectMapper json, @Value("${app.duel.bank:classpath:duel-bank.json}") Resource bank) throws IOException {
        try (InputStream in = bank.getInputStream()) {
            for (Answer a : json.readValue(in, new TypeReference<List<Answer>>() {})) answers.put(a.id(), a);
        }
    }

    public boolean knowsAll(List<String> ids) {
        return ids.stream().allMatch(answers::containsKey);
    }

    // picks: 푼 순서대로 고른 보기 번호(0부터, 한 글자씩). 문제 수보다 길거나 없는 보기를 고르면 null
    public Graded grade(List<String> ids, String picks) {
        if (picks == null || picks.length() > ids.size()) return null;
        int score = 0;
        StringBuilder marks = new StringBuilder();
        for (int i = 0; i < picks.length(); i++) {
            Answer answer = answers.get(ids.get(i));
            int pick = picks.charAt(i) - '0';
            if (answer == null || pick < 0 || pick >= answer.n()) return null;
            boolean right = pick == answer.a();
            if (right) score++;
            marks.append(right ? '1' : '0');
        }
        return new Graded(score, marks.toString());
    }
}
