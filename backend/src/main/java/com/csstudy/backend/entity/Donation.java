package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

// 사이트의 "자료 기부"로 올라온 복기·요약 자료. 파일 내용까지 DB에 담아 두고,
// 저장소 커밋은 이 자료로 문제를 만들 때 함께 한다
@Entity
@Table(name = "donations", indexes = {
        @Index(name = "idx_donations_day", columnList = "donated_day")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 없이 쓰는 사이트라 브라우저가 만든 익명 ID로 기부자를 구분한다
    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    // public(공기업 필기) · major(전공필기). 저장소의 어느 폴더로 갈지 정한다
    @Column(nullable = false, length = 16)
    private String kind;

    @Column(nullable = false, length = 120)
    private String label;

    @Column(length = 200)
    private String note;

    @Column(nullable = false, length = 160)
    private String filename;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(nullable = false)
    private long size;

    // 파일 본문. 자료가 크지 않아 별도 저장소 없이 DB에 그대로 둔다
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(nullable = false)
    private byte[] data;

    // 이 자료로 문제은행을 만들고 저장소에 커밋했는지
    @Builder.Default
    @Column(nullable = false)
    private boolean handled = false;

    @Column(name = "donated_day", nullable = false)
    private LocalDate day;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
