package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// 로그인 없이 쓰는 사이트에서 방문자가 정한 닉네임. 채팅과 매일 푼 사람 순위에 같은 이름으로 나온다
@Entity
@Table(name = "visitor_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uq_visitor_profiles_visitor", columnNames = "visitor_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    @Column(nullable = false, length = 20)
    private String nickname;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
