package com.csstudy.backend;

import com.csstudy.backend.service.RankWelcomeService;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.assertj.core.api.Assertions.assertThat;

class RankWelcomeTest {
    @Test
    void arrivalIsSharedButRefreshAndMultipleTabsDoNotRepeatIt() {
        var service = new RankWelcomeService();
        var now = Instant.parse("2026-10-28T00:00:00Z");
        var arrival = service.heartbeat(1L, 1, "학습자", now);
        assertThat(arrival).hasSize(1);
        assertThat(service.heartbeat(null, null, null, now)).isEqualTo(arrival);
        assertThat(service.heartbeat(1L, 1, "학습자", now.plusSeconds(10))).isEqualTo(arrival);
        assertThat(service.heartbeat(1L, 1, "학습자", now.plusSeconds(40))).isEmpty();
        var returned = service.heartbeat(1L, 5, "학습자", now.plusSeconds(200));
        assertThat(returned).hasSize(1);
        assertThat(returned.get(0).id()).isNotEqualTo(arrival.get(0).id());
    }

    @Test
    void onlyTopFiveAccountsGenerateNoticesAndEventsExpire() {
        var service = new RankWelcomeService();
        var now = Instant.now();
        assertThat(service.heartbeat(6L, 6, "외부 순위", now)).isEmpty();
        assertThat(service.heartbeat(null, 1, "게스트", now)).isEmpty();
        for (long id = 1; id <= 5; id++) service.heartbeat(id, (int) id, "사용자" + id, now);
        assertThat(service.heartbeat(null, null, null, now)).hasSize(5);
        assertThat(service.heartbeat(null, null, null, now.plusSeconds(31))).isEmpty();
    }
}
