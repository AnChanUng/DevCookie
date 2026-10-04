package com.csstudy.backend.repository;

import com.csstudy.backend.entity.Duel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DuelRepository extends JpaRepository<Duel, Long> {
    Optional<Duel> findByCode(String code);

    boolean existsByCode(String code);
}
