package com.csstudy.backend.service;

import com.csstudy.backend.entity.User;
import com.csstudy.backend.entity.UserTier;
import com.csstudy.backend.repository.ExamProgressRepository;
import com.csstudy.backend.repository.VisitorSolvedRepository;
import com.csstudy.backend.repository.VisitorTierGrantRepository;
import com.csstudy.backend.repository.UsageEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MembershipService {
    private final ExamProgressRepository progressRepository;
    private final VisitorSolvedRepository solvedRepository;
    private final ObjectMapper json;
    private final VisitorTierGrantRepository grants;
    private final UsageEventRepository usage;
    private final AuthService auth;

    public record Membership(UserTier tier, String tierName, long solvedCount,
                             UserTier nextTier, Long nextThreshold, long remaining) {}

    public Membership current(HttpServletRequest request) {
        var user = auth.currentUser(request);
        if (user.isPresent()) return membership(user.get());
        return visitor(request.getHeader("X-Visitor-Id"));
    }

    public UserTier visitorBase(String id) {
        if (id == null || id.isBlank() || id.length() > 40) return UserTier.BRONZE;
        return grants.findById(id).map(g -> g.getTier()).orElse(UserTier.BRONZE);
    }

    public Membership visitor(String id) {
        UserTier base = visitorBase(id);
        long count = 0;
        if (id != null && id.length() <= 40) {
            var record = solvedRepository.findByVisitorId(id);
            if (record.isPresent()) count = record.get().getCount();
            else count = usage.solvedCounts().stream().filter(r -> id.equals(r[0])).mapToLong(r -> ((Number)r[2]).longValue()).sum();
        }
        return describe(base, count);
    }

    public void requireGold(HttpServletRequest request) {
        if (current(request).tier().ordinal() < UserTier.GOLD.ordinal())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "필기이론은 골드 등급부터 이용할 수 있습니다.");
    }

    // Existing rows have no base_tier; this preserves GOLD for every pre-existing account.
    // Registration explicitly saves BRONZE, so future restarts cannot turn new users into GOLD.
    public static UserTier baseTier(User user) {
        return user.getBaseTier() == null ? UserTier.GOLD : user.getBaseTier();
    }

    public Membership membership(User user) {
        long saved = progressRepository.findByUserId(user.getId()).stream().mapToLong(p -> count(p.getData())).sum();
        // Reuse the existing rank count for historical/coding progress; devices are merged by max, not sum.
        long reported = solvedRepository.findByUserId(user.getId()).stream().mapToLong(v -> v.getCount()).max().orElse(0);
        return describe(baseTier(user), Math.max(saved, reported));
    }

    public static Membership describe(UserTier base, long solved) {
        long count = Math.max(0, solved);
        UserTier tier = UserTier.calculate(base, count);
        UserTier next = tier == UserTier.BRONZE ? UserTier.SILVER :
                tier == UserTier.SILVER || tier == UserTier.GOLD ? UserTier.DIAMOND :
                tier == UserTier.DIAMOND ? UserTier.RUBY : null;
        Long threshold = null;
        if (next == UserTier.SILVER) threshold = 50L;
        else if (next == UserTier.DIAMOND) threshold = 200L;
        else if (next == UserTier.RUBY) threshold = 1000L;
        return new Membership(tier, tier.label(), count, next, threshold, threshold == null ? 0 : Math.max(0, threshold - count));
    }

    public Map<Long, Long> savedCounts() {
        Map<Long, Long> counts = new HashMap<>();
        progressRepository.dataByUser().forEach(row -> counts.merge((Long) row[0], count((String) row[1]), Long::sum));
        return counts;
    }

    private long count(String data) {
        try {
            var stats = json.readTree(data).path("stats");
            if (!stats.isObject()) return 0;
            long count = 0;
            for (var stat : stats) {
                if (stat.path("c").asLong() > 0 || stat.path("w").asLong() > 0) count++;
            }
            return count;
        } catch (Exception error) { return 0; } // Legacy/corrupt records cannot grant an accidental promotion.
    }
}
