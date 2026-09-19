package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "usage_events", indexes = {
        @Index(name = "idx_usage_events_day", columnList = "event_day")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 없이 쓰는 사이트라 브라우저가 만든 익명 ID로 방문자를 구분한다
    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    // view: 페이지 열람, exam: 풀이 완료
    @Column(name = "event_type", nullable = false, length = 16)
    private String type;

    @Column(nullable = false, length = 200)
    private String path;

    @Column(length = 60)
    private String detail;

    // 한국 시간 기준 날짜. 일별 집계를 DB 종류와 무관하게 group by로 처리하려고 따로 둔다
    @Column(name = "event_day", nullable = false)
    private LocalDate day;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
