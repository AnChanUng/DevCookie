package com.csstudy.backend.service;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.UUID;

// 지금 공부 중인 사람 수. 화면에 잠깐 보여 주는 값이라 DB에 남기지 않고 메모리에만 둔다
@Component
public class PresenceService {

    private static final int PRESENCE_SECONDS = 150;
    private static final int PRESENCE_MAX = 5000;

    private final Map<String, Instant> presence = new ConcurrentHashMap<>();
    private record ChatMember(String id, String nickname, Instant at) {}
    private final Map<String, ChatMember> chat = new ConcurrentHashMap<>();

    public String joinChat(String visitorId, String nickname) {
        pruneChat();
        if (!chat.containsKey(visitorId) && chat.size() >= PRESENCE_MAX) return null;
        ChatMember member = chat.compute(visitorId, (key, previous) -> new ChatMember(
                previous == null ? UUID.randomUUID().toString() : previous.id(), nickname, Instant.now()));
        beat(visitorId);
        return member.id();
    }

    public void leaveChat(String visitorId) { if (visitorId != null) chat.remove(visitorId); }

    private void pruneChat() { chat.values().removeIf(m -> m.at().isBefore(Instant.now().minusSeconds(90))); }

    public List<Map<String, String>> chatMembers() {
        pruneChat();
        return chat.values().stream().sorted(java.util.Comparator.comparing(ChatMember::id))
                .map(m -> Map.of("id", m.id(), "nickname", m.nickname())).toList();
    }

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
