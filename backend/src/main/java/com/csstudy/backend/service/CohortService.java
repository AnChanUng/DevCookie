package com.csstudy.backend.service;

import com.csstudy.backend.entity.CohortMembership;
import com.csstudy.backend.repository.CohortMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class CohortService {
    private final CohortMembershipRepository members;

    public void captureUser(Long userId) { capture("user:" + userId, userId, null); }
    public void captureVisitor(String visitorId, Long userId) { capture("visitor:" + visitorId, userId, visitorId); }
    private void capture(String key, Long userId, String visitorId) {
        if (members.existsById(key)) return;
        members.save(CohortMembership.builder().subjectKey(key).userId(userId).visitorId(visitorId)
                .program("SSAFY").generation(16).campus("대전").classNumber(4).capturedAt(Instant.now()).build());
    }

    public record Badge(String name) {}

    @Transactional(readOnly = true)
    public java.util.List<Badge> badges(Long userId, String visitorId) {
        java.util.List<CohortMembership> records;
        if (userId != null) records = members.findByUserId(userId);
        else if (visitorId != null && !visitorId.isBlank() && visitorId.length() <= 40)
            records = members.findById("visitor:" + visitorId).filter(m -> m.getUserId() == null).stream().toList();
        else records = java.util.List.of();
        return records.stream().map(m -> new Badge(m.getGeneration() + "기 " + m.getCampus() + " " + m.getClassNumber() + "반"))
                .distinct().toList();
    }

    @Transactional
    public void attachVisitorAccount(String visitorId, Long userId) {
        if (visitorId == null) return;
        members.findById("visitor:" + visitorId).filter(m -> m.getUserId() == null).ifPresent(m -> {
            m.setUserId(userId);
            members.save(m);
        });
    }
}
