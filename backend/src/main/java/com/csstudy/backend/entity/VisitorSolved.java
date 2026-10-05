package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// 방문자의 브라우저가 알려 준 "지금까지 푼 문제 수". 같은 문제를 여러 번 풀어도 한 문제로 센 값이다
@Entity
@Table(name = "visitor_solved",
        uniqueConstraints = @UniqueConstraint(name = "uq_visitor_solved_visitor", columnNames = "visitor_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorSolved {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    @Column(nullable = false)
    private int count;

    // 동기화 계정에 로그인한 기기면 그 계정. 같은 계정의 기기들은 순위에서 한 사람으로 합친다
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
