package com.csstudy.backend.repository;

import com.csstudy.backend.entity.DuelPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DuelPlayerRepository extends JpaRepository<DuelPlayer, Long> {
    List<DuelPlayer> findByDuelCode(String duelCode);

    Optional<DuelPlayer> findByDuelCodeAndVisitorId(String duelCode, String visitorId);

    long countByDuelCode(String duelCode);
}
