package com.csstudy.backend.service;

import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.*;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.HashMap;

@Service @RequiredArgsConstructor @Order(20)
public class CohortRolloutService implements ApplicationRunner {
    private final MembershipRolloutRepository rollout;
    private final UserRepository users;
    private final VisitorTierGrantRepository grants;
    private final VisitorSolvedRepository solved;
    private final CohortService cohort;

    @Override @Transactional
    public void run(ApplicationArguments arguments) {
        if (rollout.existsById(2L)) return;
        users.findAll().stream().filter(u -> MembershipService.baseTier(u) == UserTier.GOLD)
                .forEach(u -> cohort.captureUser(u.getId()));
        var linked = new HashMap<String, Long>();
        solved.findAll().stream().filter(v -> v.getUserId() != null).forEach(v -> linked.put(v.getVisitorId(), v.getUserId()));
        grants.findAll().stream().filter(g -> g.getTier() == UserTier.GOLD)
                .forEach(g -> cohort.captureVisitor(g.getVisitorId(), linked.get(g.getVisitorId())));
        rollout.save(new MembershipRollout(2L, Instant.now()));
    }
}
