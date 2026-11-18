package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "company"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 32)
    private String company;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String data;

    // data에서 한 번이라도 푼 문제 수. 저장할 때 계산해 두고, 등급 계산은 JSON을 다시 읽지 않고 이 값을 더한다.
    // 이 컬럼이 생기기 전에 저장된 행은 값이 없어서 처음 읽을 때 계산한다
    @Column(name = "solved_count")
    private Integer solvedCount;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
