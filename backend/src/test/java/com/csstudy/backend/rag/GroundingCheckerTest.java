package com.csstudy.backend.rag;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GroundingCheckerTest {

    @Test
    void splitsAnswerIntoCheckableSentences() {
        String answer = "교착 상태는 네 가지 조건이 모두 성립할 때 생깁니다. 상호 배제, 점유 대기, 비선점, 순환 대기입니다.\n"
                + "- 짧음\n"
                + "**은행원 알고리즘**은 안전 상태를 유지할 때만 자원을 할당합니다.\n"
                + "참고: 데드락(Deadlock)";
        List<String> sentences = GroundingChecker.sentences(answer);
        assertThat(sentences).containsExactly(
                "교착 상태는 네 가지 조건이 모두 성립할 때 생깁니다.",
                "상호 배제, 점유 대기, 비선점, 순환 대기입니다.",
                "은행원 알고리즘은 안전 상태를 유지할 때만 자원을 할당합니다.");
    }
}
