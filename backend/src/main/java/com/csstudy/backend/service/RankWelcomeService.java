package com.csstudy.backend.service;

import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

/** Short-lived notices for the current single backend instance. No account identifiers are exposed. */
@Service
public class RankWelcomeService {
    public record Notice(String id, int rank, String nickname, Instant at) {}
    private final Map<Long, Instant> seen = new HashMap<>();
    private final Deque<Notice> notices = new ArrayDeque<>();

    public synchronized List<Notice> heartbeat(Long userId, Integer rank, String nickname, Instant now) {
        Instant cutoff = now.minusSeconds(150);
        seen.values().removeIf(at -> at.isBefore(cutoff));
        notices.removeIf(n -> n.at().isBefore(now.minusSeconds(30)));
        if (userId != null && rank != null && rank >= 1 && rank <= 5) {
            if (seen.put(userId, now) == null) {
                notices.addLast(new Notice(UUID.randomUUID().toString(), rank, nickname, now));
                while (notices.size() > 20) notices.removeFirst();
            }
        }
        return List.copyOf(notices);
    }
}
