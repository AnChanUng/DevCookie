package com.csstudy.backend;

import com.csstudy.backend.rag.RagService;
import com.csstudy.backend.rag.TeiReranker;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// 출처 검증 기준 보정. LLM 답변 없이도 기준을 정할 수 있게,
//   근거가 있는 문장  = 질문의 정답 문서에서 뽑은 문장
//   근거가 없는 문장 = 다른 과목 문서에서 뽑은 문장
// 을 같은 근거(재정렬 상위 5개)와 대조해 점수가 잘 갈리는 기준을 찾는다.
//   RAG_EVAL=1 ./gradlew test --tests '*GroundingCalibrationTest' -i
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles({"test", "rag"})
@EnabledIfEnvironmentVariable(named = "RAG_EVAL", matches = "1")
class GroundingCalibrationTest {

    static final int QUESTIONS = Integer.parseInt(System.getenv().getOrDefault("GROUND_QUESTIONS", "30"));

    @Autowired RagService rag;
    @Autowired TeiReranker reranker;
    @Autowired ObjectMapper json;

    @Test
    void calibrate() throws Exception {
        JsonNode items = json.readTree(new ClassPathResource("rag/eval-set.json").getInputStream()).get("items");
        List<Double> supported = new ArrayList<>(), unsupported = new ArrayList<>();
        int used = 0;
        for (JsonNode item : items) {
            if (!item.get("answerable").asBoolean() || used >= QUESTIONS) continue;
            String q = item.get("question").asText();
            List<Document> evidence = rag.retrieve(q, 0.05);
            if (evidence.isEmpty()) continue;
            String gold = item.get("gold").get(0).asText();
            String goldCategory = gold.substring(0, gold.indexOf('/'));
            Document own = evidence.stream().filter(d -> gold.equals(d.getMetadata().get("source"))).findFirst().orElse(null);
            if (own == null) continue;
            // 근거가 있는 문장: 근거 조각 안의 문장 하나
            String positive = firstSentence(own.getText());
            // 근거가 없는 문장: 다른 과목의 검색 결과에서 뽑은 문장
            String other = items.get((used * 7 + 41) % items.size()).get("question").asText();
            Document foreign = rag.vectorSearch(other, 10).stream()
                    .filter(d -> !String.valueOf(d.getMetadata().get("source")).startsWith(goldCategory)).findFirst().orElse(null);
            if (positive == null || foreign == null) continue;
            String negative = firstSentence(foreign.getText());
            if (negative == null) continue;
            supported.add(top(positive, evidence));
            unsupported.add(top(negative, evidence));
            used++;
        }
        Collections.sort(supported);
        Collections.sort(unsupported);
        List<Double> candidates = new ArrayList<>(supported);
        candidates.addAll(unsupported);
        Collections.sort(candidates);
        double best = 0, bestAcc = -1;
        for (double c : candidates) {
            double acc = (supported.stream().filter(s -> s >= c).count() + unsupported.stream().filter(s -> s < c).count()) / (double) (supported.size() + unsupported.size());
            if (acc > bestAcc) { bestAcc = acc; best = c; }
        }
        double th = best;
        System.out.printf("[grounding] pairs=%d supportedMedian=%.4f unsupportedMedian=%.4f bestThreshold=%.4f accuracy=%.1f%% supportedFlagged=%d unsupportedPassed=%d%n",
                supported.size(), median(supported), median(unsupported), th, 100 * bestAcc,
                supported.stream().filter(s -> s < th).count(), unsupported.stream().filter(s -> s >= th).count());
        for (double fixed : new double[]{0.01, 0.05, 0.1, 0.3}) {
            System.out.printf("[grounding] threshold=%.2f supportedFlagged=%d/%d unsupportedPassed=%d/%d%n", fixed,
                    supported.stream().filter(s -> s < fixed).count(), supported.size(),
                    unsupported.stream().filter(s -> s >= fixed).count(), unsupported.size());
        }
    }

    private double top(String sentence, List<Document> evidence) {
        List<Document> best = reranker.rerank(sentence, evidence, 1, Double.NEGATIVE_INFINITY);
        return best.isEmpty() || best.get(0).getScore() == null ? 0 : best.get(0).getScore();
    }

    // 조각 머리말([제목 · 단락])을 빼고, 판단할 만한 길이의 첫 문장
    static String firstSentence(String text) {
        String body = text.replaceFirst("^\\[[^\\]]*]\\n", "");
        for (String s : body.split("(?<=[.?!])\\s+|\\n+")) {
            String t = s.replaceAll("^[\\s*#>\\-•\\d.)|]+", "").replace("**", "").trim();
            if (t.length() >= 20 && !t.startsWith("```")) return t;
        }
        return null;
    }

    static double median(List<Double> sorted) {
        return sorted.isEmpty() ? 0 : sorted.get(sorted.size() / 2);
    }
}
