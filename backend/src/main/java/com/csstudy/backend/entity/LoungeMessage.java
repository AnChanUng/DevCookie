package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// 접속해 있는 사람들이 나누는 채팅 한 줄. 닉네임은 보낸 시점의 것을 그대로 남긴다
@Entity
@Table(name = "lounge_messages", uniqueConstraints = @UniqueConstraint(columnNames = {"visitor_id", "client_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoungeMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    @Column(name = "client_id", length = 36)
    private String clientId;

    @Column(nullable = false, length = 20)
    private String nickname;

    @Column(nullable = false, length = 200)
    private String text;

    // 한 곳에서의 도배를 막는 용도. IP 원문은 남기지 않고 해시만 둔다
    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
