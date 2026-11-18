package com.csstudy.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

// 재대결 매칭 측정. 대결을 끝낸 두 사람이 동시에 "한 판 더"를 누르는 상황을 여러 쌍이 한꺼번에 만든다.
// 두 사람이 같은 다음 방을 받으면 매칭 성공으로 보고, 성공률과 요청 지연(p50/p95/p99)을 출력한다.
// 평소 테스트에서는 돌지 않는다:  DUEL_BENCHMARK=1 ./gradlew test --tests '*DuelRematchBenchmarkTest'
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
@EnabledIfEnvironmentVariable(named = "DUEL_BENCHMARK", matches = "1")
class DuelRematchBenchmarkTest {

    static final int PAIRS = Integer.parseInt(System.getenv().getOrDefault("DUEL_PAIRS", "500"));
    static final int CONCURRENT_PAIRS = Integer.parseInt(System.getenv().getOrDefault("DUEL_CONCURRENCY", "25"));

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("app.duel.bank", () -> "classpath:duel-bank.json");
    }

    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    record Answer(String id, int a, int n) {}

    @Test
    void measureRematchMatching() throws Exception {
        List<String> ids;
        try (InputStream in = new ClassPathResource("duel-bank.json").getInputStream()) {
            ids = new ObjectMapper().readValue(in, new TypeReference<List<Answer>>() {}).stream().map(Answer::id).toList();
        }
        // 서버를 데운다
        for (int i = 0; i < 20; i++) rematchPair(create(ids, i), ids, i, new ArrayList<>());

        List<Long> latencies = Collections.synchronizedList(new ArrayList<>());
        AtomicInteger matched = new AtomicInteger(), errors = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(CONCURRENT_PAIRS);
        List<Future<?>> futures = new ArrayList<>();
        long started = System.nanoTime();
        for (int p = 0; p < PAIRS; p++) {
            int pair = p;
            futures.add(pool.submit(() -> {
                try {
                    String code = create(ids, pair);
                    if (rematchPair(code, ids, pair, latencies)) matched.incrementAndGet();
                } catch (Exception e) {
                    errors.incrementAndGet();
                }
                return null;
            }));
        }
        for (Future<?> f : futures) f.get();
        pool.shutdown();
        double seconds = (System.nanoTime() - started) / 1e9;

        List<Long> sorted = new ArrayList<>(latencies);
        Collections.sort(sorted);
        System.out.printf("[rematch-bench] pairs=%d concurrentPairs=%d matched=%d (%.1f%%) errors=%d requests=%d p50=%.1fms p95=%.1fms p99=%.1fms max=%.1fms elapsed=%.1fs%n",
                PAIRS, CONCURRENT_PAIRS, matched.get(), 100.0 * matched.get() / PAIRS, errors.get(), sorted.size(),
                pct(sorted, 50), pct(sorted, 95), pct(sorted, 99), sorted.isEmpty() ? 0 : sorted.get(sorted.size() - 1) / 1e6, seconds);
    }

    // 두 사람이 동시에 재대결을 누른다. 같은 방 번호를 받으면 true
    private boolean rematchPair(String code, List<String> ids, int pair, List<Long> latencies) throws Exception {
        CountDownLatch go = new CountDownLatch(1);
        ExecutorService two = Executors.newFixedThreadPool(2);
        try {
            List<Future<String>> codes = new ArrayList<>();
            for (int player = 0; player < 2; player++) {
                List<String> pick = slice(ids, pair * 7 + player * 3 + 100);
                codes.add(two.submit(() -> {
                    go.await();
                    long t = System.nanoTime();
                    HttpResponse<String> r = send("POST", "/api/v1/duels/" + code + "/rematch", Map.of("questionIds", pick));
                    latencies.add(System.nanoTime() - t);
                    if (r.statusCode() != 200) throw new IllegalStateException(r.statusCode() + " " + r.body());
                    return json.readTree(r.body()).get("code").asText();
                }));
            }
            go.countDown();
            return codes.get(0).get().equals(codes.get(1).get());
        } finally {
            two.shutdownNow();
        }
    }

    private String create(List<String> ids, int pair) throws Exception {
        HttpResponse<String> r = send("POST", "/api/v1/duels", Map.of("questionIds", slice(ids, pair * 5)));
        if (r.statusCode() != 200) throw new IllegalStateException(r.statusCode() + " " + r.body());
        return json.readTree(r.body()).get("code").asText();
    }

    private static List<String> slice(List<String> ids, int from) {
        int start = Math.floorMod(from, ids.size() - 10);
        return ids.subList(start, start + 10);
    }

    private HttpResponse<String> send(String method, String path, Object body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build();
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static double pct(List<Long> sorted, int p) {
        if (sorted.isEmpty()) return 0;
        int index = (int) Math.ceil(p / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(index, sorted.size() - 1))) / 1e6;
    }
}
