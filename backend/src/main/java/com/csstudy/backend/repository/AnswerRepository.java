package com.csstudy.backend.repository;

import com.csstudy.backend.entity.Answer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByQuestionIdOrderByCreatedAtDesc(Long questionId);

    List<Answer> findByQuestionIdAndUserIdOrderByCreatedAtDesc(Long questionId, Long userId);

    List<Answer> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT AVG(a.score) FROM Answer a WHERE a.question.id = :questionId")
    Double findAverageScoreByQuestionId(@Param("questionId") Long questionId);

    @Query("SELECT AVG(a.score) FROM Answer a")
    Double findOverallAverageScore();

    long countByScoreGreaterThanEqual(int score);

    long countByScoreBetween(int minScore, int maxScore);

    long countByScoreLessThan(int score);

    @Query("SELECT a.score FROM Answer a ORDER BY a.createdAt DESC")
    List<Integer> findRecentScores();

    long countByUserIsNull();

    long countByCreatedAtGreaterThanEqual(LocalDateTime since);

    // [사용자 ID, 채점 수, 평균 점수, 마지막 채점 시각]
    @Query("select a.user.id, count(a), avg(a.score), max(a.createdAt) from Answer a " +
            "where a.user is not null group by a.user.id")
    List<Object[]> summaryByUser();

    // [채점 시각, 닉네임, 문제 제목, 점수] 로그인 없이 채점한 기록은 닉네임이 null
    @Query("select a.createdAt, u.nickname, q.title, a.score from Answer a " +
            "left join a.user u left join a.question q order by a.id desc")
    List<Object[]> recentForAdmin(Pageable pageable);

    // [문제 제목, 채점 수, 평균 점수]
    @Query("select q.title, count(a), avg(a.score) from Answer a join a.question q " +
            "group by q.id, q.title order by count(a) desc")
    List<Object[]> topQuestions(Pageable pageable);
}
