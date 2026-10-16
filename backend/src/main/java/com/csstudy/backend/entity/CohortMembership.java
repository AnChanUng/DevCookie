package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

// Internal roster, intentionally not associated with any public response DTO.
@Entity @Table(name = "cohort_memberships")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CohortMembership {
    @Id @Column(length = 64) private String subjectKey;
    private Long userId;
    @Column(length = 40) private String visitorId;
    @Column(nullable = false, length = 16) private String program;
    @Column(nullable = false) private int generation;
    @Column(nullable = false, length = 16) private String campus;
    @Column(nullable = false) private int classNumber;
    @Column(nullable = false) private Instant capturedAt;
}
