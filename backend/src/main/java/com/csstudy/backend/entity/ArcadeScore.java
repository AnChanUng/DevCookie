package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// 숨은 오락실의 게임별 최고 기록. 한 방문자는 게임마다 한 줄만 가지며, 더 좋은 기록을 내면 그 줄을 고친다
@Entity
@Table(name = "arcade_scores",
        uniqueConstraints = @UniqueConstraint(name = "uq_arcade_scores_game_visitor", columnNames = {"game", "visitor_id"}),
        indexes = @Index(name = "idx_arcade_scores_game_score", columnList = "game, score"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArcadeScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 순위판 이름. 난이도가 있는 게임은 mines-easy처럼 난이도까지 붙는다
    @Column(nullable = false, length = 24)
    private String game;

    @Column(nullable = false, length = 12)
    private String nickname;

    // 점수 · 걸린 초 · 뒤집은 횟수 · ms. 클수록 좋은지 작을수록 좋은지는 게임마다 다르다
    @Column(nullable = false)
    private long score;

    // 로그인 없이 쓰는 사이트라 브라우저가 만든 익명 ID로 같은 사람을 알아본다
    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    // 한 곳에서 이름만 바꿔 순위판을 도배하는 것을 막는 용도. IP 원문은 남기지 않고 해시만 둔다
    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
