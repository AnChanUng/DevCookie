package com.csstudy.backend.security;

import com.csstudy.backend.entity.SecurityEvent;
import com.csstudy.backend.repository.SecurityEventRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class SecurityAudit {
    private final SecurityEventRepository events;
    private final LinkedHashMap<String, Long> sampled = new LinkedHashMap<>();
    private long minute;
    private int samples;
    private synchronized boolean sample(String key) {
        long now=System.currentTimeMillis();
        if (now / 60_000 != minute) { minute=now / 60_000; samples=0; }
        if (samples >= 60 || now - sampled.getOrDefault(key, 0L) < 60_000) return false;
        sampled.remove(key); sampled.put(key,now); samples++;
        while (sampled.size()>20_000) sampled.remove(sampled.keySet().iterator().next());
        return true;
    }
    public void record(HttpServletRequest request, String ip, String reason, int status, int count) {
        if (!sample(ip+":"+reason)) return;
        try {
            events.saveAndFlush(SecurityEvent.builder().ip(clean(ip,64)).userAgent(clean(request.getHeader("User-Agent"),300))
                    .method(clean(request.getMethod(),12)).path(clean(request.getRequestURI(),200))
                    .reason(reason).status(status).requestsInWindow(count).occurredAt(Instant.now()).build());
        } catch (RuntimeException ex) { log.warn("Security event storage unavailable"); }
    }
    private String clean(String value,int max) {
        if (value==null) return "";
        String sanitized=value.replaceAll("[\\p{Cntrl}]", " ");
        return sanitized.substring(0,Math.min(sanitized.length(),max));
    }
    @Scheduled(cron="0 0 * * * *") @Transactional
    public void prune() {
        events.deleteByOccurredAtBefore(Instant.now().minus(7,ChronoUnit.DAYS));
        var excess=events.newestIds(PageRequest.of(2000,1));
        if (!excess.isEmpty()) events.deleteByIdLessThanEqual(excess.get(0));
    }
}
