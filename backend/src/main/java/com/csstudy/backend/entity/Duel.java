package com.csstudy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

// 같은 문제를 여럿이 풀어 점수를 겨루는 대결 방. 문제 번호 목록만 들고 있고 문제 내용은 프런트에 있다
@Entity
@Table(name = "duels",
        uniqueConstraints = @UniqueConstraint(name = "uq_duels_code", columnNames = "code"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Duel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 링크에 들어가는 짧은 방 번호
    @Column(nullable = false, length = 8)
    private String code;

    // 출제할 문제 번호들을 JSON 배열 문자열로 둔다
    @Column(name = "question_ids", nullable = false, columnDefinition = "TEXT")
    private String questionIds;

    // 이 방에서 "한 판 더"로 열린 다음 방. 누가 먼저 눌렀든 모두 같은 방으로 간다
    @Column(name = "next_code", length = 8)
    private String nextCode;

    // 단체전: 링크를 몰라도 목록에서 누구나 들어올 수 있는 방. 예전에 만든 방은 값이 없다(비공개로 본다)
    @Column(name = "is_open")
    private Boolean open;

    // 목록에 보여 줄 방 이름(과목)
    @Column(length = 40)
    private String title;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
