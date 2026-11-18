package com.csstudy.backend.rag;

import org.springframework.ai.document.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

// 출처 검증. LLM 답변을 문장으로 나누고, 문장마다 근거 조각들과 cross-encoder 점수를 매겨
// 가장 높은 점수가 기준보다 낮으면 "근거 확인 안 됨"으로 표시한다. 답변이 근거 밖 내용을 지어냈는지 보는 장치다
public class GroundingChecker {

    // 문장 끝(다/요/. ? !) 또는 줄바꿈에서 자른다
    private static final Pattern SENTENCE = Pattern.compile("(?<=[.?!。])\\s+|(?<=다\\.)|(?<=요\\.)|\\n+");
    // 너무 짧은 조각(목록 기호, "예:" 등)은 판단하지 않는다
    static final int MIN_CHARS = 12;

    public record Claim(String sentence, boolean supported, double score, String source) {}
    public record Report(List<Claim> claims, double unsupportedRatio) {}

    private final TeiReranker reranker;
    private final double minSupport;

    public GroundingChecker(TeiReranker reranker, double minSupport) {
        this.reranker = reranker;
        this.minSupport = minSupport;
    }

    public Report check(String answer, List<Document> evidence) {
        List<Claim> claims = new ArrayList<>();
        if (answer == null || evidence.isEmpty()) return new Report(claims, 0);
        for (String sentence : sentences(answer)) {
            List<Document> best = reranker.rerank(sentence, evidence, 1, Double.NEGATIVE_INFINITY);
            double score = best.isEmpty() || best.get(0).getScore() == null ? 0 : best.get(0).getScore();
            String source = best.isEmpty() ? null : String.valueOf(best.get(0).getMetadata().get("source"));
            claims.add(new Claim(sentence, score >= minSupport, score, source));
        }
        long unsupported = claims.stream().filter(c -> !c.supported()).count();
        return new Report(claims, claims.isEmpty() ? 0 : (double) unsupported / claims.size());
    }

    // 판단할 문장만 남긴다. "참고" 표시 줄과 짧은 조각은 뺀다
    static List<String> sentences(String answer) {
        List<String> out = new ArrayList<>();
        for (String part : SENTENCE.split(answer)) {
            String s = part.replaceAll("^[\\s*#>\\-•\\d.)]+", "").replace("**", "").trim();
            if (s.length() < MIN_CHARS || s.startsWith("참고")) continue;
            out.add(s);
        }
        return out;
    }
}
