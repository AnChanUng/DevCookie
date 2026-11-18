package com.csstudy.backend.repository;

import com.csstudy.backend.entity.Difficulty;
import com.csstudy.backend.entity.Question;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // 응답에 과목 이름이 들어가므로 문제를 읽을 때 과목도 함께 가져온다(트랜잭션 밖 지연 로딩 · N+1 방지)
    @Override
    @EntityGraph(attributePaths = "category")
    List<Question> findAll();

    @Override
    @EntityGraph(attributePaths = "category")
    Optional<Question> findById(Long id);

    @EntityGraph(attributePaths = "category")
    List<Question> findByCategorySlug(String slug);

    @EntityGraph(attributePaths = "category")
    List<Question> findByDifficulty(Difficulty difficulty);

    @EntityGraph(attributePaths = "category")
    @Query("SELECT q FROM Question q WHERE LOWER(q.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(q.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Question> searchByTitleOrContent(@Param("keyword") String keyword);

    long countByStudyCountGreaterThan(int count);

    long countByCategoryId(Long categoryId);

    long countByDifficulty(Difficulty difficulty);

    @EntityGraph(attributePaths = "category")
    @Query("SELECT q FROM Question q ORDER BY q.studyCount ASC, q.lastStudiedAt ASC NULLS FIRST")
    List<Question> findLeastStudied(Pageable pageable);

    @EntityGraph(attributePaths = "category")
    @Query("SELECT q FROM Question q WHERE q.category.slug = :slug ORDER BY q.studyCount ASC, q.lastStudiedAt ASC NULLS FIRST")
    List<Question> findLeastStudiedByCategory(@Param("slug") String slug, Pageable pageable);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.lastStudiedAt >= :since")
    long countStudiedSince(@Param("since") LocalDateTime since);

    @Query("SELECT q.category.name, COUNT(q) FROM Question q WHERE q.studyCount > 0 GROUP BY q.category.name ORDER BY COUNT(q) DESC")
    List<Object[]> countStudiedByCategory();
}
