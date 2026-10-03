package com.csstudy.backend.repository;

import com.csstudy.backend.entity.LoungeMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Repository
public interface LoungeMessageRepository extends JpaRepository<LoungeMessage, Long> {

    List<LoungeMessage> findByOrderByIdDesc(Pageable pageable);

    @Transactional
    long deleteByCreatedAtBefore(Instant cutoff);
}
