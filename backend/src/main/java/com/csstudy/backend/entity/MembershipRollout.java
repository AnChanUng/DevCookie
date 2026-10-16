package com.csstudy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="membership_rollout") @Getter @NoArgsConstructor @AllArgsConstructor
public class MembershipRollout {
    @Id private Long id;
    @Column(nullable=false) private Instant initializedAt;
}
