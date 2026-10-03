package com.csstudy.backend.service;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// 지금 공부 중인 사람 수. 화면에 잠깐 보여 주는 값이라 DB에 남기지 않고 메모리에만 둔다
@Component
public class PresenceService {

    private static final int PRESENCE_SECONDS = 150;
    private static final int PRESENCE_MAX = 5000;

    private final Map<String, Instant> presence = new ConcurrentHashMap<>();

    public void beat(String visitorId) {
        if (visitorId != null && (count() < PRESENCE_MAX || presence.containsKey(visitorId))) {
            presence.put(visitorId, Instant.now());
        }
    }

    public int count() {
        Instant cutoff = Instant.now().minusSeconds(PRESENCE_SECONDS);
        presence.values().removeIf(seen -> seen.isBefore(cutoff));
        return presence.size();
    }
}
