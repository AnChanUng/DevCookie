package com.csstudy.backend.repository;
import com.csstudy.backend.entity.DirectThread;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DirectThreadRepository extends JpaRepository<DirectThread, Long> {
    Optional<DirectThread> findByLowUserAndHighUser(Long low, Long high);
    List<DirectThread> findByLowUserOrHighUserOrderByIdDesc(Long low, Long high);
}
