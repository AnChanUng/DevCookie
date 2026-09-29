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

    // view: 페이지 열람, exam: 풀이 완료, click: 홈 코너(멘탈 기르기 · 오늘의 운세) 버튼 누름
    @Column(name = "event_type", nullable = false, length = 16)
    private String type;

    @Column(nullable = false, length = 200)
    private String path;

    @Column(length = 60)
    private String detail;

    // 풀이 완료(exam)일 때만 채운다: 맞힌 수 / 푼 문제 수 / 걸린 시간(초)
    private Integer score;

    private Integer total;

    private Integer seconds;

    // mobile / desktop
    @Column(length = 10)
    private String device;

    // 이 사이트로 들어오기 직전 사이트의 호스트. 세션의 첫 열람에만 붙는다
    @Column(length = 100)
    private String referrer;

    // 한국 시간 기준 날짜. 일별 집계를 DB 종류와 무관하게 group by로 처리하려고 따로 둔다
    @Column(name = "event_day", nullable = false)
    private LocalDate day;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
