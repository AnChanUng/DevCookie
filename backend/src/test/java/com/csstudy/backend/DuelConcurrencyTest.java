package com.csstudy.backend;

import com.csstudy.backend.repository.DuelPlayerRepository;
import com.csstudy.backend.repository.DuelRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.IntFunction;

import static org.junit.jupiter.api.Assertions.assertEquals;

// 대결 API에 같은 요청이 한꺼번에 몰릴 때 방이 중복으로 생기거나 결과가 두 번 반영되지 않는지 실제 PostgreSQL에서 확인한다
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class DuelConcurrencyTest {

    static final int REQUESTS = 100;

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
        // 실제 정답표로 채점한다
        registry.add("app.duel.bank", () -> "classpath:duel-bank.json");
    }

    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    @Autowired DuelRepository duels;
    @Autowired DuelPlayerRepository players;

    final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    @Test
    void simultaneousRematchRequestsOpenExactlyOneNextRoom() throws Exception {
        List<String> ids = bankIds(0, 3);
        String code = create(ids, null);
        long before = duels.count();

        // 100명이 동시에 "한 판 더"를 누른다. 저마다 다른 문제를 뽑아 보낸다
        List<HttpResponse<String>> responses = concurrently(i -> request("POST", "/api/v1/duels/" + code + "/rematch",
                Map.of("questionIds", bankIds(3 + i % 50, 3))));

        Set<String> nextCodes = new HashSet<>();
        for (HttpResponse<String> r : responses) {
            assertEquals(200, r.statusCode(), r.body());
            nextCodes.add(json.readTree(r.body()).get("code").asText());
        }
        long created = duels.count() - before;
        System.out.printf("[rematch] requests=%d distinctNextCodes=%d roomsCreated=%d duplicates=%d%n",
                REQUESTS, nextCodes.size(), created, created - 1);
        assertEquals(1, nextCodes.size(), "모두 같은 다음 방으로 가야 한다");
        assertEquals(1, created, "다음 방은 한 번만 만들어져야 한다");
    }

    @Test
    void retriedCreateWithTheSameKeyOpensOneRoom() throws Exception {
        String key = UUID.randomUUID().toString();
        long before = duels.count();
        List<HttpResponse<String>> responses = concurrently(i -> request("POST", "/api/v1/duels",
                Map.of("questionIds", bankIds(0, 3)), Map.of("Idempotency-Key", key)));

        Set<String> codes = new HashSet<>();
        for (HttpResponse<String> r : responses) {
            assertEquals(200, r.statusCode(), r.body());
            codes.add(json.readTree(r.body()).get("code").asText());
        }
        long created = duels.count() - before;
        System.out.printf("[create] requests=%d distinctCodes=%d roomsCreated=%d duplicates=%d%n",
                REQUESTS, codes.size(), created, created - 1);
        assertEquals(1, codes.size());
        assertEquals(1, created);
    }

    @Test
    void repeatedFinalReportsAreCountedOnce() throws Exception {
        List<String> ids = bankIds(0, 3);
        String code = create(ids, null);
        String picks = correctPicks(ids);

        // 같은 사람이 마지막 답안을 100번 동시에 보낸다(재시도 · 중복 클릭)
        List<HttpResponse<String>> responses = concurrently(i -> request("PUT", "/api/v1/duels/" + code + "/players",
                Map.of("visitorId", "dup-a", "nickname", "A", "picks", picks, "answered", 3, "done", true, "seconds", 30)));
        for (HttpResponse<String> r : responses) assertEquals(200, r.statusCode(), r.body());
        send(request("PUT", "/api/v1/duels/" + code + "/players",
                Map.of("visitorId", "dup-b", "nickname", "B", "picks", wrongPicks(ids), "answered", 3, "done", true, "seconds", 30)));

        long rows = players.findByDuelCode(code).stream().filter(p -> p.getVisitorId().equals("dup-a")).count();
        JsonNode record = json.readTree(send(get("/api/v1/duels/record", "dup-a")).body());
        System.out.printf("[report] requests=%d playerRows=%d recordedGames=%d%n", REQUESTS, rows, record.get("total").asInt());
        assertEquals(1, rows, "같은 사람의 기록은 한 줄이어야 한다");
        assertEquals(1, record.get("total").asInt(), "결과는 한 번만 반영되어야 한다");
        assertEquals(1, record.get("wins").asInt());
    }

    // ---- helpers ----

    private List<HttpResponse<String>> concurrently(IntFunction<HttpRequest> build) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(REQUESTS);
        CountDownLatch ready = new CountDownLatch(REQUESTS), go = new CountDownLatch(1);
        List<Future<HttpResponse<String>>> futures = new ArrayList<>();
        try {
            for (int i = 0; i < REQUESTS; i++) {
                HttpRequest request = build.apply(i);
                futures.add(pool.submit(() -> {
                    ready.countDown();
                    go.await();
                    return send(request);
                }));
            }
            ready.await();
            go.countDown();
            List<HttpResponse<String>> out = new ArrayList<>();
            for (Future<HttpResponse<String>> f : futures) out.add(f.get());
            return out;
        } finally {
            pool.shutdownNow();
        }
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest request(String method, String path, Object body) {
        return request(method, path, body, Map.of());
    }

    private HttpRequest request(String method, String path, Object body, Map<String, String> headers) {
        try {
            HttpRequest.Builder b = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                    .timeout(Duration.ofSeconds(60)).header("Content-Type", "application/json")
                    .method(method, HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
            headers.forEach(b::header);
            return b.build();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private HttpRequest get(String path, String visitor) {
        return HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).header("X-Visitor-Id", visitor).GET().build();
    }

    private String create(List<String> ids, String key) throws Exception {
        HttpResponse<String> r = send(request("POST", "/api/v1/duels", Map.of("questionIds", ids),
                key == null ? Map.of() : Map.of("Idempotency-Key", key)));
        assertEquals(200, r.statusCode(), r.body());
        return json.readTree(r.body()).get("code").asText();
    }

    record Answer(String id, int a, int n) {}

    private static List<Answer> bank() {
        try (InputStream in = new ClassPathResource("duel-bank.json").getInputStream()) {
            return Collections.unmodifiableList(new ObjectMapper().readValue(in, new TypeReference<List<Answer>>() {}));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private static List<String> bankIds(int from, int count) {
        return bank().subList(from, from + count).stream().map(Answer::id).toList();
    }

    private static String correctPicks(List<String> ids) {
        StringBuilder sb = new StringBuilder();
        for (String id : ids) sb.append(bank().stream().filter(a -> a.id().equals(id)).findFirst().orElseThrow().a());
        return sb.toString();
    }

    private static String wrongPicks(List<String> ids) {
        StringBuilder sb = new StringBuilder();
        for (String id : ids) {
            Answer a = bank().stream().filter(x -> x.id().equals(id)).findFirst().orElseThrow();
            sb.append((a.a() + 1) % a.n());
        }
        return sb.toString();
    }
}
