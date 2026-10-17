package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="security_events", indexes=@Index(name="idx_security_event_at", columnList="occurred_at"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SecurityEvent {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=64) private String ip;
    @Column(nullable=false, length=300) private String userAgent;
    @Column(nullable=false, length=12) private String method;
    @Column(nullable=false, length=200) private String path;
    @Column(nullable=false, length=40) private String reason;
    private int status;
    private int requestsInWindow;
    @Column(name="occurred_at", nullable=false) private Instant occurredAt;
}
