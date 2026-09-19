package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

// 문제에 대한 오류 제보. 복원 문제라 오타나 정답 오류가 섞일 수 있어 방문자가 바로 알릴 수 있게 한다
@Entity
@Table(name = "question_reports", indexes = {
        @Index(name = "idx_question_reports_day", columnList = "report_day")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 없이 쓰는 사이트라 브라우저가 만든 익명 ID로 제보자를 구분한다
    @Column(name = "visitor_id", nullable = false, length = 40)
    private String visitorId;

    // 제보한 화면 경로
    @Column(nullable = false, length = 200)
    private String path;

    // 문제 데이터가 프런트엔드에 있어서 DB 외래키가 아니라 문자열 ID로 받는다
    @Column(name = "question_id", nullable = false, length = 40)
    private String questionId;

    // 나중에 문제를 찾기 쉽도록 남겨 두는 지문 앞부분
    @Column(name = "question_text", length = 500)
    private String questionText;

    // answer(정답 오류) · typo(오타) · explain(해설) · etc(기타)
    @Column(nullable = false, length = 16)
    private String kind;

    @Column(length = 1000)
    private String message;

    @Builder.Default
    @Column(nullable = false)
    private boolean handled = false;

    @Column(name = "report_day", nullable = false)
    private LocalDate day;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
