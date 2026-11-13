package com.csstudy.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.RejectedExecutionException;

@Component
public class RecoveryMailer {
    private static final Logger LOG = LoggerFactory.getLogger(RecoveryMailer.class);
    private final RestClient client;
    private final ThreadPoolTaskExecutor executor;
    private final String apiKey;
    private final String from;
    private final String origin;

    public RecoveryMailer(@Value("${RECOVERY_RESEND_API_KEY:}") String apiKey,
                          @Value("${RECOVERY_EMAIL_FROM:}") String from,
                          @Value("${RECOVERY_WEB_ORIGIN:https://cs-study-platform.vercel.app}") String origin) {
        this.apiKey = apiKey;
        this.from = from;
        this.origin = origin.replaceAll("/+$", "");
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        this.client = RestClient.builder().requestFactory(factory).baseUrl("https://api.resend.com").build();
        this.executor = new ThreadPoolTaskExecutor();
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(32);
        executor.setThreadNamePrefix("recovery-mail-");
        executor.initialize();
    }

    public boolean configured() {
        return !apiKey.isBlank() && !from.isBlank();
    }

    public boolean send(String recipient, String action, String token) {
        String subject = action.equals("verify") ? "복구 이메일 인증" : "비밀번호 재설정";
        String link = origin + "/account?recovery=" + action + "#token=" + token;
        try {
            executor.execute(() -> deliver(recipient, subject, link));
            return true;
        } catch (RejectedExecutionException error) {
            LOG.warn("Recovery email queue is full");
            return false;
        }
    }

    private void deliver(String recipient, String subject, String link) {
        try {
            client.post().uri("/emails").contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> headers.setBearerAuth(apiKey))
                    .body(Map.of("from", from, "to", List.of(recipient), "subject", "[CS Study] " + subject,
                            "text", "아래 링크는 15분 동안 한 번만 사용할 수 있습니다.\n" + link))
                    .retrieve().toBodilessEntity();
        } catch (RuntimeException error) {
            LOG.warn("Recovery email delivery failed ({})", error.getClass().getSimpleName());
        }
    }

    @jakarta.annotation.PreDestroy
    void shutdown() {
        executor.shutdown();
    }
}
