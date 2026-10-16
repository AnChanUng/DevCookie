package com.csstudy.backend.service;
import com.csstudy.backend.entity.TierAward;
import com.csstudy.backend.repository.TierAwardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class TierAwardService {
    private final TierAwardRepository awards;
    @Transactional
    public void attachVisitorAccount(String visitorId,Long userId) {
        if(visitorId == null) return;
        awards.findById("visitor:"+visitorId).ifPresent(old -> {
            String key="user:"+userId;
            TierAward row=awards.findForUpdate(key).orElseGet(()->new TierAward(key,-1));
            row.setTierLevel(Math.max(row.getTierLevel(),old.getTierLevel()));
            awards.save(row);
        });
    }
}
