package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// 대결 방에 들어온 한 사람의 진행 상황. 문제를 풀 때마다 덮어쓴다
@Entity
@Table(name = "duel_players",
        uniqueConstraints = @UniqueConstraint(name = "uq_duel_players", columnNames = {"duel_code", "visitor_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DuelPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "duel_code", nullable = false, length = 8)
    private String duelCode;

    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    @Column(nullable = false, length = 20)
    private String nickname;

    // 맞힌 문제 수
    @Column(nullable = false)
    private int score;

    // 지금까지 답한 문제 수
    @Column(nullable = false)
    private int answered;

    // 문제별 정오답. 푼 순서대로 맞으면 1, 틀리면 0 (예: "1011"). 복기 화면에서 쓴다
    @Column(length = 30)
    private String marks;

    @Column(nullable = false)
    private boolean done;

    // null denotes a legacy participant, who had already pressed start.
    private Boolean started;

    // 시작부터 걸린 시간(초)
    @Column(nullable = false)
    private int seconds;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // 푼 순서대로 고른 보기 번호(예: "2031"). 점수와 정오답은 서버가 이 값과 정답표로 계산한다
    @Column(length = 30)
    private String picks;

    // 처음 진행 상황을 올린 시각. 이보다 짧게 걸렸다고 올려도 받지 않는다
    @Column(name = "first_report_at")
    private Instant firstReportAt;
}
