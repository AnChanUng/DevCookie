package com.csstudy.backend.repository;

import com.csstudy.backend.entity.ArcadeScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArcadeScoreRepository extends JpaRepository<ArcadeScore, Long> {

    // 점수가 같으면 먼저 세운 사람이 위에 선다
    List<ArcadeScore> findTop3ByGameOrderByScoreDescUpdatedAtAsc(String game);

    List<ArcadeScore> findTop3ByGameOrderByScoreAscUpdatedAtAsc(String game);

    Optional<ArcadeScore> findByGameAndVisitorId(String game, String visitorId);

    long countByGameAndIpHash(String game, String ipHash);

    List<ArcadeScore> findByOrderByGameAscUpdatedAtDesc();
}
