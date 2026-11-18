package com.csstudy.backend;

import com.csstudy.backend.rag.RagIngestService;
import com.csstudy.backend.rag.RagService;
import com.csstudy.backend.rag.TeiReranker;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

// RAG 검색 평가. 로컬 RAG 서비스(rag/docker-compose.yml)가 떠 있어야 하며 평소 테스트에서는 돌지 않는다.
//   RAG_EVAL=1 ./gradlew test --tests '*RagEvalTest' -i
// 같은 질문에 대해 ① 1차 벡터 검색 상위 5개 ② 1차 20개를 재정렬한 상위 5개를 비교한다.
// 답할 수 있는 질문은 Hit@1/3/5 · MRR@5로, 답할 수 없는 질문은 최고 점수 기준으로 걸러 내는지(거부율)로 본다.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles({"test", "rag"})
@EnabledIfEnvironmentVariable(named = "RAG_EVAL", matches = "1")
class RagEvalTest {

    // 1차 후보 수는 RAG_FIRST_K로 바꿔 가며 정확도와 지연을 비교한다. 이미 넣은 문서는 RAG_SKIP_INGEST=1로 다시 넣지 않는다
    static final int FIRST_K = Integer.parseInt(System.getenv().getOrDefault("RAG_FIRST_K", "20")), FINAL_K = 5;

    @Autowired RagService rag;
    @Autowired TeiReranker reranker;
    @Autowired RagIngestService ingest;
    @Autowired ObjectMapper json;

    record Row(String id, boolean answerable, Set<String> gold, int vectorRank, int rerankRank,
               double vectorTop, double rerankTop, long vectorMs, long rerankMs, List<String> vectorSources, List<String> rerankSources) {}

    @Test
    void evaluateRetrieval() throws Exception {
        long t0 = System.currentTimeMillis();
        RagIngestService.Result indexed = "1".equals(System.getenv("RAG_SKIP_INGEST")) ? null : ingest.ingest();
        long ingestMs = System.currentTimeMillis() - t0;

        JsonNode items = json.readTree(new ClassPathResource("rag/eval-set.json").getInputStream()).get("items");
        List<Row> rows = new ArrayList<>();
        for (JsonNode item : items) {
            String q = item.get("question").asText();
            Set<String> gold = new HashSet<>();
            item.get("gold").forEach(g -> gold.add(g.asText()));

            long a = System.currentTimeMillis();
            List<Document> first = rag.vectorSearch(q, FIRST_K);
            long vectorMs = System.currentTimeMillis() - a;
            List<Document> reranked = reranker.rerank(q, first, FIRST_K, Double.NEGATIVE_INFINITY);
            long rerankMs = System.currentTimeMillis() - a;

            List<Document> vTop = first.subList(0, Math.min(FINAL_K, first.size()));
            List<Document> rTop = reranked.subList(0, Math.min(FINAL_K, reranked.size()));
            rows.add(new Row(item.get("id").asText(), item.get("answerable").asBoolean(), gold,
                    rank(vTop, gold), rank(rTop, gold),
                    first.isEmpty() || first.get(0).getScore() == null ? 0 : first.get(0).getScore(),
                    reranked.isEmpty() || reranked.get(0).getScore() == null ? 0 : reranked.get(0).getScore(),
                    vectorMs, rerankMs, sources(vTop), sources(rTop)));
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("firstK", FIRST_K);
        report.put("indexed", indexed);
        report.put("ingestMs", ingestMs);
        List<Row> answerable = rows.stream().filter(Row::answerable).toList();
        List<Row> unanswerable = rows.stream().filter(r -> !r.answerable()).toList();
        report.put("answerable", answerable.size());
        report.put("unanswerable", unanswerable.size());
        report.put("vector", retrieval(answerable, true));
        report.put("rerank", retrieval(answerable, false));
        report.put("vectorRefusal", refusal(answerable, unanswerable, true));
        report.put("rerankRefusal", refusal(answerable, unanswerable, false));
        report.put("latencyMs", Map.of(
                "vectorP50", pct(rows.stream().map(Row::vectorMs).toList(), 50), "vectorP95", pct(rows.stream().map(Row::vectorMs).toList(), 95),
                "withRerankP50", pct(rows.stream().map(Row::rerankMs).toList(), 50), "withRerankP95", pct(rows.stream().map(Row::rerankMs).toList(), 95)));
        report.put("rows", rows);

        File out = new File("build/reports/rag-eval-k" + FIRST_K + ".json");
        out.getParentFile().mkdirs();
        json.copy().enable(SerializationFeature.INDENT_OUTPUT).writeValue(out, report);
        Map<String, Object> summary = new LinkedHashMap<>(report);
        summary.remove("rows");
        System.out.println("[rag-eval] " + json.writeValueAsString(summary));
    }

    // 정답 문서가 처음 나온 순위(1부터). 없으면 0
    static int rank(List<Document> docs, Set<String> gold) {
        for (int i = 0; i < docs.size(); i++) if (gold.contains(String.valueOf(docs.get(i).getMetadata().get("source")))) return i + 1;
        return 0;
    }

    static List<String> sources(List<Document> docs) {
        return docs.stream().map(d -> d.getMetadata().get("source") + "@" + String.format("%.4f", d.getScore() == null ? 0 : d.getScore())).toList();
    }

    static Map<String, Object> retrieval(List<Row> rows, boolean vector) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int k : new int[]{1, 3, 5}) {
            long hits = rows.stream().filter(r -> { int rank = vector ? r.vectorRank() : r.rerankRank(); return rank > 0 && rank <= k; }).count();
            m.put("hit@" + k, round(100.0 * hits / rows.size()));
        }
        double mrr = rows.stream().mapToDouble(r -> { int rank = vector ? r.vectorRank() : r.rerankRank(); return rank == 0 ? 0 : 1.0 / rank; }).average().orElse(0);
        m.put("mrr@5", round(mrr));
        return m;
    }

    // 최고 점수가 기준보다 낮으면 근거 없음(거부)으로 본다. 기준을 바꿔 가며
    // (답할 수 있는 질문을 살린 비율 + 답할 수 없는 질문을 거부한 비율) / 2 가 가장 큰 기준을 고른다
    static Map<String, Object> refusal(List<Row> answerable, List<Row> unanswerable, boolean vector) {
        List<Double> candidates = new ArrayList<>();
        for (Row r : answerable) candidates.add(vector ? r.vectorTop() : r.rerankTop());
        for (Row r : unanswerable) candidates.add(vector ? r.vectorTop() : r.rerankTop());
        Collections.sort(candidates);
        double best = 0, bestBalanced = -1;
        for (double c : candidates) {
            double kept = answerable.stream().filter(r -> (vector ? r.vectorTop() : r.rerankTop()) >= c).count() / (double) answerable.size();
            double refused = unanswerable.stream().filter(r -> (vector ? r.vectorTop() : r.rerankTop()) < c).count() / (double) unanswerable.size();
            double balanced = (kept + refused) / 2;
            if (balanced > bestBalanced) { bestBalanced = balanced; best = c; }
        }
        double threshold = best;
        long falseRefusals = answerable.stream().filter(r -> (vector ? r.vectorTop() : r.rerankTop()) < threshold).count();
        long correctRefusals = unanswerable.stream().filter(r -> (vector ? r.vectorTop() : r.rerankTop()) < threshold).count();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("threshold", round(threshold));
        m.put("unanswerableRefused%", round(100.0 * correctRefusals / unanswerable.size()));
        m.put("unanswerableAnswered%", round(100.0 * (unanswerable.size() - correctRefusals) / unanswerable.size()));
        m.put("answerableRefused%", round(100.0 * falseRefusals / answerable.size()));
        m.put("balancedAccuracy%", round(100 * bestBalanced));
        return m;
    }

    static long pct(List<Long> values, int p) {
        List<Long> s = new ArrayList<>(values);
        Collections.sort(s);
        return s.get(Math.max(0, (int) Math.ceil(p / 100.0 * s.size()) - 1));
    }

    static double round(double v) {
        return Math.round(v * 10000) / 10000.0;
    }
}
