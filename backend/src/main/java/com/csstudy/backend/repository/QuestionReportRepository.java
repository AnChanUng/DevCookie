package com.csstudy.backend.repository;

import com.csstudy.backend.entity.QuestionReport;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface QuestionReportRepository extends JpaRepository<QuestionReport, Long> {

    List<QuestionReport> findByOrderByHandledAscIdDesc(Pageable pageable);

    long countByHandledFalse();

    // 한 방문자가 하루에 보낼 수 있는 제보 수를 막는 데 쓴다
    long countByVisitorIdAndDay(String visitorId, LocalDate day);

    // 같은 문제에 이미 처리하지 않은 제보가 있으면 중복으로 보고 더 받지 않는다
    boolean existsByQuestionIdAndPathAndHandledFalse(String questionId, String path);

    // [문제 ID, 경로, 제보 수] 제보가 몰린 문제부터
    @Query("select r.questionId, r.path, count(r) from QuestionReport r " +
            "group by r.questionId, r.path order by count(r) desc")
    List<Object[]> topReported(Pageable pageable);

    @Query("select count(r) from QuestionReport r where r.day >= :from")
    long countSince(@Param("from") LocalDate from);
}
