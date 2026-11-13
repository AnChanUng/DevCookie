package com.csstudy.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Column(nullable = false)
    private String password;

    @JsonIgnore
    @Column(length = 254)
    private String recoveryEmail;

    @JsonIgnore
    @Column(length = 254)
    private String pendingRecoveryEmail;

    @JsonIgnore
    @Column(length = 64, unique = true)
    private String recoveryVerificationHash;

    @JsonIgnore
    private Instant recoveryVerificationExpiresAt;

    @JsonIgnore
    @Column(length = 64, unique = true)
    private String passwordResetHash;

    @JsonIgnore
    private Instant passwordResetExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "base_tier", length = 16)
    private UserTier baseTier;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
