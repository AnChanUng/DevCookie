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

    @Column(nullable = false)
    private boolean done;

    // 시작부터 걸린 시간(초)
    @Column(nullable = false)
    private int seconds;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
