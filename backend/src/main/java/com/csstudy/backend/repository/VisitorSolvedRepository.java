package com.csstudy.backend.repository;

import com.csstudy.backend.entity.VisitorSolved;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface VisitorSolvedRepository extends JpaRepository<VisitorSolved, Long> {

    Optional<VisitorSolved> findByVisitorId(String visitorId);
    List<VisitorSolved> findByUserId(Long userId);
}
