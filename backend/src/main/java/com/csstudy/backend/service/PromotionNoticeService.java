package com.csstudy.backend.service;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import java.util.UUID;
@Service @RequiredArgsConstructor
public class PromotionNoticeService {
    private final ApplicationEventPublisher events;
    public record Notice(String id,String nickname,String tierName) {}
    public record Promoted(String subjectKey,int level,Notice notice) {}
    public void announce(String key,MembershipService.Membership before,MembershipService.Membership after) {
        int oldLevel=before.tier().ordinal()*5+5-before.division();
        int newLevel=after.tier().ordinal()*5+5-after.division();
        if(newLevel>oldLevel) events.publishEvent(new Promoted(key,newLevel,
                new Notice(UUID.randomUUID().toString(),after.nickname(),after.tierName())));
    }
}
