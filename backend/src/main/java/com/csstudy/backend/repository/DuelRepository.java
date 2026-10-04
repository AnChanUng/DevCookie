package com.csstudy.backend.repository;

import com.csstudy.backend.entity.Duel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface DuelRepository extends JpaRepository<Duel, Long> {
    Optional<Duel> findByCode(String code);

    boolean existsByCode(String code);

    // 최근에 열린 단체전 방
    List<Duel> findTop20ByOpenTrueAndCreatedAtAfterOrderByCreatedAtDesc(Instant after);
}
