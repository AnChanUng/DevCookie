package com.csstudy.backend.rag;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.generation.augmentation.ContextualQueryAugmenter;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.ObjectProvider;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// RAG 학습 도우미. 1차 Top-K(벡터 검색) → Reranking → 2차 Top-K로 근거를 고르고,
// 근거가 하나도 남지 않으면 LLM을 부르지 않고 답을 거부한다
public class RagService {

    public static final String REFUSAL = "학습 자료에서 이 질문의 근거를 찾지 못했습니다. 다른 표현으로 다시 물어보거나, 전공 학습 자료에 있는 주제로 질문해 주세요.";

    private static final PromptTemplate ANSWER = new PromptTemplate("""
            아래는 전공 학습 자료에서 찾은 근거입니다.
            ---------------------
            {context}
            ---------------------
            근거에 있는 내용만으로 한국어로 답하세요. 근거에 없는 내용은 지어내지 말고, 근거로 답할 수 없으면
            "학습 자료에서 근거를 찾지 못했습니다."라고만 답하세요. 답변 끝에 참고한 자료 제목을 적으세요.

            질문: {query}
            """);
    private static final PromptTemplate EMPTY = new PromptTemplate(REFUSAL);

    public record Source(String source, String title, String section, Double score) {}
    public record Answer(String answer, boolean refused, List<Source> sources) {}

    private final VectorStore vectorStore;
    private final TeiReranker reranker;
    private final RagProperties props;
    private final ChatClient chat;

    public RagService(VectorStore vectorStore, TeiReranker reranker, RagProperties props, ObjectProvider<ChatModel> chatModel) {
        this.vectorStore = vectorStore;
        this.reranker = reranker;
        this.props = props;
        ChatModel model = chatModel.getIfAvailable();
        this.chat = model == null ? null : ChatClient.builder(model)
                .defaultAdvisors(RetrievalAugmentationAdvisor.builder()
                        .documentRetriever(VectorStoreDocumentRetriever.builder().vectorStore(vectorStore).topK(props.firstK()).build())
                        .documentPostProcessors(reranker)
                        .queryAugmenter(ContextualQueryAugmenter.builder()
                                .promptTemplate(ANSWER).emptyContextPromptTemplate(EMPTY).allowEmptyContext(false).build())
                        .build())
                .build();
    }

    public boolean canAnswer() {
        return chat != null;
    }

    // 1차 벡터 검색만 (재정렬 전 기준선)
    public List<Document> vectorSearch(String question, int k) {
        return vectorStore.similaritySearch(SearchRequest.builder().query(question).topK(k).build());
    }

    // 1차 Top-K → 재정렬 → 2차 Top-K. threshold를 0으로 주면 점수와 관계없이 남긴다(평가용)
    public List<Document> retrieve(String question, double threshold) {
        return reranker.rerank(question, vectorSearch(question, props.firstK()), props.finalK(), threshold);
    }

    public Answer ask(String question) {
        if (chat == null) throw new IllegalStateException("답변 모델이 설정되지 않았습니다.");
        // 근거가 없으면 LLM을 부르지 않는다(비용과 지어낸 답변을 함께 줄인다)
        List<Document> evidence = retrieve(question, props.minRerankScore());
        if (evidence.isEmpty()) return new Answer(REFUSAL, true, List.of());
        ChatClientResponse response = chat.prompt().user(question).call().chatClientResponse();
        String text = response.chatResponse() == null || response.chatResponse().getResult() == null ? ""
                : response.chatResponse().getResult().getOutput().getText();
        @SuppressWarnings("unchecked")
        List<Document> used = (List<Document>) response.context().getOrDefault(RetrievalAugmentationAdvisor.DOCUMENT_CONTEXT, List.of());
        boolean refused = used.isEmpty() || text == null || text.contains("근거를 찾지 못했습니다");
        return new Answer(text, refused, sources(used));
    }

    static List<Source> sources(List<Document> docs) {
        List<Source> out = new ArrayList<>();
        for (Document d : docs) {
            Map<String, Object> m = d.getMetadata();
            out.add(new Source(String.valueOf(m.get("source")), String.valueOf(m.get("title")), String.valueOf(m.get("section")), d.getScore()));
        }
        return out;
    }
}
