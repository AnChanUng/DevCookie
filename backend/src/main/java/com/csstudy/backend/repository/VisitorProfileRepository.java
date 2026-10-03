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

    List<VisitorProfile> findByVisitorIdIn(Collection<String> visitorIds);
}
