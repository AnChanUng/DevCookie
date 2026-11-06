package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "direct_threads", uniqueConstraints = @UniqueConstraint(columnNames = {"low_user", "high_user"}))
@Getter @Setter @NoArgsConstructor
public class DirectThread {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "low_user", nullable = false) private Long lowUser;
    @Column(name = "high_user", nullable = false) private Long highUser;
    private Long requestedBy;
    private boolean friends;
}
