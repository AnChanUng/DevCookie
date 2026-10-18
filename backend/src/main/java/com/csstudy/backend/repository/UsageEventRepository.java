package com.csstudy.backend.repository;

import com.csstudy.backend.entity.UsageEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface UsageEventRepository extends JpaRepository<UsageEvent, Long> {

    @Query("select e.day, count(distinct e.visitorId) from UsageEvent e where e.type = 'view' " +
            "and e.day between :from and :through and e.path not like '/admin%' group by e.day order by e.day")
    List<Object[]> publicDailyVisitors(@Param("from") LocalDate from, @Param("through") LocalDate through);

    @Query("select count(distinct e.visitorId) from UsageEvent e where e.type = 'view' " +
            "and e.day between :from and :through and e.path not like '/admin%'")
    long publicVisitors(@Param("from") LocalDate from, @Param("through") LocalDate through);

    @Query("select count(e) from UsageEvent e where e.type = 'view' " +
            "and e.day between :from and :through and e.path not like '/admin%'")
    long publicPageViews(@Param("from") LocalDate from, @Param("through") LocalDate through);

    @Query("select count(e) from UsageEvent e where e.type = 'exam' and e.day <= :through and e.path not like '/admin%'")
    long publicExamCompletions(@Param("through") LocalDate through);

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

    List<UsageEvent> findByTypeOrderByIdDesc(String type, Pageable pageable);

    // 지금 접속 중인 방문자 수
    @Query("select count(distinct e.visitorId) from UsageEvent e where e.createdAt >= :since")
    long activeSince(@Param("since") Instant since);

    // 그날 처음 온 방문자 수
    @Query("select count(distinct e.visitorId) from UsageEvent e where e.day = :day " +
            "and not exists (select 1 from UsageEvent p where p.visitorId = e.visitorId and p.day < :day)")
    long newVisitorsOn(@Param("day") LocalDate day);

    // [경로, 풀이 방식, 횟수, 방문자 수, 평균 정답률(%), 평균 소요(초)] 점수가 기록된 풀이만
    @Query("select e.path, e.detail, count(e), count(distinct e.visitorId), avg(e.score * 100.0 / e.total), avg(e.seconds) " +
            "from UsageEvent e where e.type = 'exam' and e.total > 0 and e.day >= :from " +
            "group by e.path, e.detail order by count(e) desc")
    List<Object[]> scoresByPathSince(@Param("from") LocalDate from);

    // [방문자, 열람 수, 첫 방문, 마지막 방문] 코너 버튼 클릭(click)은 열람 수에서 뺀다
    @Query("select e.visitorId, sum(case when e.type = 'click' then 0 else 1 end), min(e.createdAt), max(e.createdAt) from UsageEvent e " +
            "where e.day >= :from group by e.visitorId order by max(e.createdAt) desc")
    List<Object[]> visitorsSince(@Param("from") LocalDate from, Pageable pageable);

    // [방문자, 풀이 수, 평균 정답률(%)]
    @Query("select e.visitorId, count(e), avg(case when e.total > 0 then e.score * 100.0 / e.total else null end) " +
            "from UsageEvent e where e.type = 'exam' and e.day >= :from group by e.visitorId")
    List<Object[]> visitorScoresSince(@Param("from") LocalDate from);

    // [코너, 버튼, 오늘, 기간 안, 누적, 누적 방문자 수] 누적까지 한 번에 세려고 기간은 case로 나눈다
    @Query("select e.path, e.detail, sum(case when e.day = :today then 1 else 0 end), " +
            "sum(case when e.day >= :from then 1 else 0 end), count(e), count(distinct e.visitorId) " +
            "from UsageEvent e where e.type = 'click' group by e.path, e.detail order by count(e) desc")
    List<Object[]> clicks(@Param("from") LocalDate from, @Param("today") LocalDate today);

    // [기기, 방문자 수]
    @Query("select e.device, count(distinct e.visitorId) from UsageEvent e " +
            "where e.day >= :from and e.device is not null group by e.device")
    List<Object[]> devicesSince(@Param("from") LocalDate from);

    // [유입 경로, 횟수]
    @Query("select e.referrer, count(e) from UsageEvent e " +
            "where e.day >= :from and e.referrer is not null group by e.referrer order by count(e) desc")
    List<Object[]> referrersSince(@Param("from") LocalDate from, Pageable pageable);

    // 시간대별 분포를 서버에서 한국 시간으로 나누려고 시각만 가져온다
    @Query("select e.createdAt from UsageEvent e where e.type = 'view' and e.day >= :from")
    List<Instant> viewTimesSince(@Param("from") LocalDate from);

    // [방문자, 문제집(경로), 문제 수] 같은 문제집은 여러 번 풀어도 가장 많이 푼 한 번만 센다.
    // 코딩 문제(cospro)의 total은 테스트 케이스 수라서 한 문제로 센다
    @Query("select e.visitorId, e.path, max(case when e.detail = 'cospro' then 1 else coalesce(e.total, 0) end) from UsageEvent e " +
            "where e.type = 'exam' and e.visitorId is not null group by e.visitorId, e.path")
    List<Object[]> solvedCounts();
}
