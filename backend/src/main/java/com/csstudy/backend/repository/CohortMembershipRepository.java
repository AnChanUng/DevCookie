package com.csstudy.backend.repository;
import com.csstudy.backend.entity.CohortMembership;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CohortMembershipRepository extends JpaRepository<CohortMembership, String> {
    java.util.List<CohortMembership> findByUserId(Long userId);
}
