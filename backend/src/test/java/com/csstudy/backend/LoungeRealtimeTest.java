package com.csstudy.backend;

import com.csstudy.backend.controller.LoungeController;
import com.csstudy.backend.entity.LoungeMessage;
import com.csstudy.backend.repository.LoungeMessageRepository;
import com.csstudy.backend.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockHttpServletRequest;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LoungeRealtimeTest {
    @Test
    void hidesPreviousKoreanDayButRetainsDatabaseArchive() {
        var repo = mock(LoungeMessageRepository.class);
        var stream = mock(LoungeStreamService.class);
        var controller = new LoungeController(repo, mock(VisitorProfileService.class),
                mock(PresenceService.class), mock(AdminAuth.class), stream, mock(AuthService.class));
        Instant midnight = LocalDate.now(ZoneId.of("Asia/Seoul")).atStartOfDay(ZoneId.of("Asia/Seoul")).toInstant();
        var yesterday = message(1L, midnight.minusMillis(1), "yesterday");
        var today = message(2L, midnight, "today");
        when(repo.findByOrderByIdDesc(any(Pageable.class))).thenReturn(List.of(today, yesterday));
        var rows = (List<?>)controller.messages(null).get("messages");
        assertEquals(1, rows.size());
        assertEquals("today", ((Map<?,?>)rows.get(0)).get("text"));
        controller.newDay();
        verify(stream).publish(anyMap());
        // Admin still sees both days, and a day transition never deletes database rows.
        assertEquals(2, controller.adminList("admin").size());
        verify(repo, never()).deleteByCreatedAtBefore(any());
        verify(repo, never()).deleteById(any());
    }

    @Test
    void retryAfterLostResponseReturnsExistingRowWithoutSavingTwice() {
        var repo = mock(LoungeMessageRepository.class);
        var profiles = mock(VisitorProfileService.class);
        var stream = mock(LoungeStreamService.class);
        var controller = new LoungeController(repo, profiles, mock(PresenceService.class), mock(AdminAuth.class), stream, mock(AuthService.class));
        var saved = message(9L, Instant.now(), "hello");
        saved.setClientId("request-1");
        when(repo.findByVisitorIdAndClientId("visitor-1", "request-1")).thenReturn(Optional.of(saved));
        var response = controller.send(Map.of("visitorId", "visitor-1", "nickname", "name", "text", "hello", "clientId", "request-1"), new MockHttpServletRequest());
        assertEquals(200, response.getStatusCode().value());
        assertEquals(9L, ((Map<?,?>)response.getBody()).get("id"));
        verify(repo, never()).save(any());
        verifyNoInteractions(profiles, stream);
    }

    private LoungeMessage message(Long id, Instant at, String text) {
        return LoungeMessage.builder().id(id).visitorId("visitor-1").nickname("name").text(text).createdAt(at).build();
    }
}
