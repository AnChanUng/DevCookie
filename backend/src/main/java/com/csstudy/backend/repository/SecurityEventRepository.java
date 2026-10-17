package com.csstudy.backend.repository;

import com.csstudy.backend.entity.SecurityEvent;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.Pageable;
import java.time.Instant;
import java.util.List;

public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    List<SecurityEvent> findByOccurredAtGreaterThanEqualOrderByIdDesc(Instant since, Pageable page);
    long deleteByOccurredAtBefore(Instant cutoff);
    @Query("select e.id from SecurityEvent e order by e.id desc") List<Long> newestIds(Pageable page);
    long deleteByIdLessThanEqual(Long id);
}
