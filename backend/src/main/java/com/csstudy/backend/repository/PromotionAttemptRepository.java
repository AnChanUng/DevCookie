package com.csstudy.backend.repository;
import com.csstudy.backend.entity.PromotionAttempt;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface PromotionAttemptRepository extends JpaRepository<PromotionAttempt,String> {
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from PromotionAttempt a where a.id = :id and a.subjectKey = :key")
    Optional<PromotionAttempt> findForUpdate(@Param("id") String id,@Param("key") String key);
    Optional<PromotionAttempt> findByIdAndSubjectKey(String id,String subjectKey);
}
