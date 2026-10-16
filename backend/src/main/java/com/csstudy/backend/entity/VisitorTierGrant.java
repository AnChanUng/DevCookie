package com.csstudy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="visitor_tier_grants") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VisitorTierGrant {
    @Id @Column(length=40) private String visitorId;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=16) private UserTier tier;
}
