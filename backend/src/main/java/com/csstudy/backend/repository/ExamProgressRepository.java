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
    List<ExamProgress> findByUserId(Long userId);
    // 저장해 둔 푼 문제 수의 합. 큰 JSON을 불러와 파싱하지 않고 DB에서 더한다
    @Query("select coalesce(sum(p.solvedCount), 0) from ExamProgress p where p.user.id = :userId and p.solvedCount is not null")
    long sumSolvedCount(@org.springframework.data.repository.query.Param("userId") Long userId);
    // 푼 문제 수를 아직 계산해 두지 않은 예전 행
    List<ExamProgress> findByUserIdAndSolvedCountIsNull(Long userId);

    @Query("select p.user.id, p.data from ExamProgress p")
    List<Object[]> dataByUser();

    // [사용자 ID, 저장한 문제은행 수, 마지막 저장 시각]
    @Query("select p.user.id, count(p), max(p.updatedAt) from ExamProgress p group by p.user.id")
    List<Object[]> summaryByUser();

    // [문제은행, 저장한 계정 수]
    @Query("select p.company, count(p) from ExamProgress p group by p.company order by count(p) desc")
    List<Object[]> countByCompany();
}
