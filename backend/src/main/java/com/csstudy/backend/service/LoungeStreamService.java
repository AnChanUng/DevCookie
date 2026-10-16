package com.csstudy.backend.service;

import jakarta.annotation.PreDestroy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.*;

// Slow/disconnected subscribers must never hold up a message's database response.
@Service
public class LoungeStreamService {
    private final Set<SseEmitter> clients = ConcurrentHashMap.newKeySet();
    private final ExecutorService delivery = new ThreadPoolExecutor(1, 1, 0, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(64), task -> {
                Thread thread = new Thread(task, "lounge-stream");
                thread.setDaemon(true);
                return thread;
            }, new ThreadPoolExecutor.DiscardOldestPolicy());

    public SseEmitter subscribe(Map<String, Object> snapshot) {
        if (clients.size() >= 200) throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "채팅 연결이 많습니다.");
        SseEmitter emitter = new SseEmitter(120_000L);
        clients.add(emitter);
        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> { clients.remove(emitter); emitter.complete(); });
        emitter.onError(error -> clients.remove(emitter));
        delivery.execute(() -> send(emitter, "messages", snapshot));
        return emitter;
    }

    public void publish(Map<String, Object> snapshot) {
        // Capture the recipients now so an older update cannot follow a new subscription's snapshot.
        var recipients = Set.copyOf(clients);
        delivery.execute(() -> recipients.forEach(client -> send(client, "messages", snapshot)));
    }

    @Scheduled(fixedDelay = 15000)
    public void heartbeat() {
        var recipients = Set.copyOf(clients);
        delivery.execute(() -> recipients.forEach(client -> send(client, "heartbeat", "")));
    }

    private void send(SseEmitter emitter, String event, Object data) {
        if (!clients.contains(emitter)) return;
        try {
            emitter.send(SseEmitter.event().name(event).data(data));
        } catch (IOException | IllegalStateException error) {
            clients.remove(emitter);
            emitter.complete();
        }
    }

    @PreDestroy
    public void close() {
        clients.forEach(SseEmitter::complete);
        delivery.shutdownNow();
    }
}
