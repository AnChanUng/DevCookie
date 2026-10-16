package com.csstudy.backend.repository;

import com.csstudy.backend.entity.VisitorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitorProfileRepository extends JpaRepository<VisitorProfile, Long> {

    Optional<VisitorProfile> findByVisitorId(String visitorId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from VisitorProfile p where p.visitorId = :id")
    Optional<VisitorProfile> findForNicknameUpdate(@org.springframework.data.repository.query.Param("id") String id);

    List<VisitorProfile> findByVisitorIdIn(Collection<String> visitorIds);
}
