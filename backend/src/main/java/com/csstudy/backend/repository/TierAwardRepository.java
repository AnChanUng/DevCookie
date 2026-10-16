package com.csstudy.backend.repository;
import com.csstudy.backend.entity.TierAward;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface TierAwardRepository extends JpaRepository<TierAward,String> {
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from TierAward a where a.subjectKey = :key")
    Optional<TierAward> findForUpdate(@Param("key") String key);
}
