package com.csstudy.backend.repository;

import com.csstudy.backend.entity.ExamProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamProgressRepository extends JpaRepository<ExamProgress, Long> {

    Optional<ExamProgress> findByUserIdAndCompany(Long userId, String company);

    // [사용자 ID, 저장한 문제은행 수, 마지막 저장 시각]
    @Query("select p.user.id, count(p), max(p.updatedAt) from ExamProgress p group by p.user.id")
    List<Object[]> summaryByUser();

    // [문제은행, 저장한 계정 수]
    @Query("select p.company, count(p) from ExamProgress p group by p.company order by count(p) desc")
    List<Object[]> countByCompany();
}
