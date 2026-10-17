package com.csstudy.backend.repository;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.HashSet;
import java.util.Set;

@Repository @RequiredArgsConstructor
public class ExistingVisitorRepository {
    private final EntityManager entities;

    // Use ID projections: a visit-only browser is eligible even without a nickname or solved problem.
    public Set<String> findAllKnownVisitorIds() {
        Set<String> ids = new HashSet<>();
        for (String entity : new String[]{"UsageEvent", "VisitorSolved", "VisitorProfile", "VisitorTierGrant",
                "LoungeMessage", "DuelPlayer", "ArcadeScore", "CohortMembership", "QuestionReport", "Donation"}) {
            ids.addAll(entities.createQuery("select distinct e.visitorId from " + entity
                    + " e where e.visitorId is not null", String.class).getResultList());
        }
        for (String entity : new String[]{"PromotionAttempt", "TierAward"}) {
            entities.createQuery("select distinct e.subjectKey from " + entity
                    + " e where e.subjectKey like 'visitor:%'", String.class).getResultList()
                    .forEach(key -> ids.add(key.substring("visitor:".length())));
        }
        ids.removeIf(id -> id.isBlank() || id.length() > 40);
        return ids;
    }
}
