package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "direct_messages", indexes = @Index(columnList = "thread_id,id"), uniqueConstraints = @UniqueConstraint(columnNames = {"sender_id", "client_id"}))
@Getter @Setter @NoArgsConstructor
public class DirectMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "thread_id", nullable = false) private Long threadId;
    @Column(name = "sender_id", nullable = false) private Long senderId;
    @Column(name = "client_id", nullable = false, length = 36) private String clientId;
    @Column(nullable = false, length = 1000) private String text;
    @Column(nullable = false) private Instant createdAt;
    private Instant readAt;
}
