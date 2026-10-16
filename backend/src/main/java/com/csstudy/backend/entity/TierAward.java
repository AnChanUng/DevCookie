package com.csstudy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="tier_awards") @Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TierAward {
    @Id @Column(length=64) private String subjectKey;
    @Column(nullable=false) private int tierLevel;
}
