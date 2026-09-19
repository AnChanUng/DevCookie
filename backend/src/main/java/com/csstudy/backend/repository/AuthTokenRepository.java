package com.csstudy.backend.repository;

import com.csstudy.backend.entity.AuthToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {

    Optional<AuthToken> findByTokenHash(String tokenHash);

    void deleteByTokenHash(String tokenHash);

    // [사용자 ID, 살아 있는 로그인 수, 마지막 로그인 시각]
    @Query("select t.user.id, count(t), max(t.createdAt) from AuthToken t group by t.user.id")
    List<Object[]> summaryByUser();
}
