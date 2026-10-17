package com.csstudy.backend.service;

import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.*;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.HashMap;

// New, one-time snapshot. Keep older rollout markers intact so future restarts cannot enroll new visitors.
@Service @RequiredArgsConstructor @Slf4j @Order(30)
public class ExistingUsersGoldRolloutService implements ApplicationRunner {
    public static final long ROLLOUT_ID = 3L;
    private final MembershipRolloutRepository rollout;
    private final UserRepository users;
    private final VisitorTierGrantRepository grants;
    private final VisitorSolvedRepository solved;
    private final ExistingVisitorRepository visitors;
    private final CohortService cohorts;

    @Override @Transactional
    public void run(ApplicationArguments arguments) {
        if (rollout.existsById(ROLLOUT_ID)) return;
        int promotedUsers = 0, promotedVisitors = 0;
        var accounts = users.findAll();
        for (User user : accounts) {
            if (MembershipService.baseTier(user).ordinal() < UserTier.GOLD.ordinal()) {
                user.setBaseTier(UserTier.GOLD);
                users.save(user);
                promotedUsers++;
            }
            cohorts.captureUser(user.getId());
        }
        var linked = new HashMap<String, Long>();
        solved.findAll().stream().filter(row -> row.getUserId() != null)
                .forEach(row -> linked.put(row.getVisitorId(), row.getUserId()));
        var existing = new HashMap<String, UserTier>();
        grants.findAll().forEach(grant -> existing.put(grant.getVisitorId(), grant.getTier()));
        var ids = visitors.findAllKnownVisitorIds();
        for (String id : ids) {
            if (existing.getOrDefault(id, UserTier.BRONZE).ordinal() < UserTier.GOLD.ordinal()) {
                grants.save(new VisitorTierGrant(id, UserTier.GOLD));
                promotedVisitors++;
            }
            Long userId = linked.get(id);
            cohorts.captureVisitor(id, userId);
            if (userId != null) cohorts.attachVisitorAccount(id, userId);
        }
        rollout.save(new MembershipRollout(ROLLOUT_ID, Instant.now()));
        log.info("Existing-user GOLD/cohort rollout: {} accounts, {} visitor IDs; raised {} account and {} visitor baselines",
                accounts.size(), ids.size(), promotedUsers, promotedVisitors);
    }
}
