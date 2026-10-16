package com.csstudy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="promotion_attempts") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PromotionAttempt {
    @Id @Column(length=36) private String id;
    @Column(nullable=false,length=64) private String subjectKey;
    @Column(nullable=false,columnDefinition="text") private String questions;
    @Column(columnDefinition="text") private String result;
    @Column(nullable=false) private Instant startedAt;
}
