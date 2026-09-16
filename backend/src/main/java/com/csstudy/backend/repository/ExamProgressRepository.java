package com.csstudy.backend.repository;

import com.csstudy.backend.entity.ExamProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamProgressRepository extends JpaRepository<ExamProgress, Long> {

    Optional<ExamProgress> findByUserIdAndCompany(Long userId, String company);
}
