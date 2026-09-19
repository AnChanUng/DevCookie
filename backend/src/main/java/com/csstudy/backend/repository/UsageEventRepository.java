package com.csstudy.backend.repository;

import com.csstudy.backend.entity.UsageEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UsageEventRepository extends JpaRepository<UsageEvent, Long> {

    // [조회수, 방문자 수]
    @Query("select count(e), count(distinct e.visitorId) from UsageEvent e where e.type = :type and e.day >= :from")
    List<Object[]> totalsSince(@Param("type") String type, @Param("from") LocalDate from);

    // [날짜, 조회수, 방문자 수]
    @Query("select e.day, count(e), count(distinct e.visitorId) from UsageEvent e " +
            "where e.type = :type and e.day >= :from group by e.day order by e.day")
    List<Object[]> dailySince(@Param("type") String type, @Param("from") LocalDate from);

    // [경로, 횟수, 방문자 수]
    @Query("select e.path, count(e), count(distinct e.visitorId) from UsageEvent e " +
            "where e.type = :type and e.day >= :from group by e.path order by count(e) desc")
    List<Object[]> byPathSince(@Param("type") String type, @Param("from") LocalDate from, Pageable pageable);

    List<UsageEvent> findByOrderByIdDesc(Pageable pageable);
}
