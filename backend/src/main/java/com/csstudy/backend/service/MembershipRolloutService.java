package com.csstudy.backend.service;
import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.HashSet;

// A durable, one-time snapshot: restarting must never promote future visitors to GOLD.
@Service @RequiredArgsConstructor @org.springframework.core.annotation.Order(10)
public class MembershipRolloutService implements ApplicationRunner {
    private final MembershipRolloutRepository rollout;
    private final VisitorTierGrantRepository grants;
    private final VisitorSolvedRepository solved;
    private final VisitorProfileRepository profiles;
    private final UsageEventRepository usage;
    private final UserRepository users;
    @Override @Transactional
    public void run(ApplicationArguments arguments) {
        if (rollout.existsById(1L)) return;
        var ids = new HashSet<String>();
        solved.findAll().forEach(v -> ids.add(v.getVisitorId()));
        profiles.findAll().forEach(v -> ids.add(v.getVisitorId()));
        usage.solvedCounts().forEach(row -> { if (((Number)row[2]).longValue()>0) ids.add((String)row[0]); });
        ids.forEach(id -> grants.save(new VisitorTierGrant(id,UserTier.GOLD)));
        users.findAll().stream().filter(u -> u.getBaseTier()==null).forEach(u -> {u.setBaseTier(UserTier.GOLD);users.save(u);});
        rollout.save(new MembershipRollout(1L,Instant.now()));
    }
}
