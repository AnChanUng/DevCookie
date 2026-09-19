package com.csstudy.backend.repository;

import com.csstudy.backend.entity.UserQuestionProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuestionProgressRepository extends JpaRepository<UserQuestionProgress, Long> {

    Optional<UserQuestionProgress> findByUserIdAndQuestionId(Long userId, Long questionId);

    List<UserQuestionProgress> findByUserId(Long userId);

    List<UserQuestionProgress> findByUserIdAndBookmarkedTrue(Long userId);

    long countByUserIdAndStudyCountGreaterThan(Long userId, int count);

    @Query("SELECT COUNT(p) FROM UserQuestionProgress p WHERE p.user.id = :userId AND p.lastStudiedAt >= :since")
    long countStudiedSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT p.question.category.name, COUNT(p) FROM UserQuestionProgress p WHERE p.user.id = :userId AND p.studyCount > 0 GROUP BY p.question.category.name ORDER BY COUNT(p) DESC")
    List<Object[]> countStudiedByCategory(@Param("userId") Long userId);

    // [사용자 ID, 학습한 문제 수, 북마크 수]
    @Query("select p.user.id, sum(case when p.studyCount > 0 then 1 else 0 end), " +
            "sum(case when p.bookmarked = true then 1 else 0 end) from UserQuestionProgress p group by p.user.id")
    List<Object[]> summaryByUser();
}
