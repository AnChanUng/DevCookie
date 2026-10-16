package com.csstudy.backend;
import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import com.csstudy.backend.service.*;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class MembershipRolloutTest {
 @Test void promotesExistingAnonymousVisitorsExactlyOnce() {
  var marker=mock(MembershipRolloutRepository.class);var grants=mock(VisitorTierGrantRepository.class);
  var solved=mock(VisitorSolvedRepository.class);var profiles=mock(VisitorProfileRepository.class);
  var usage=mock(UsageEventRepository.class);var users=mock(UserRepository.class);
  var done=new AtomicBoolean();
  when(marker.existsById(1L)).thenAnswer(a->done.get());
  when(marker.save(any())).thenAnswer(a->{done.set(true);return a.getArgument(0);});
  when(solved.findAll()).thenReturn(List.of(VisitorSolved.builder().visitorId("existing-no-name").count(10).updatedAt(Instant.now()).build()));
  when(profiles.findAll()).thenReturn(List.of(VisitorProfile.builder().visitorId("existing-named").nickname("name").build()));
  when(usage.solvedCounts()).thenReturn(List.<Object[]>of(new Object[]{"existing-recall", "/exam/a", 5L}));
  User old=User.builder().id(1L).nickname("existing-account").build();
  when(users.findAll()).thenReturn(List.of(old));
  var service=new MembershipRolloutService(marker,grants,solved,profiles,usage,users);
  service.run(null);
  verify(grants).save(argThat(g->g.getVisitorId().equals("existing-no-name")&&g.getTier()==UserTier.GOLD));
  verify(grants).save(argThat(g->g.getVisitorId().equals("existing-named")&&g.getTier()==UserTier.GOLD));
  verify(grants).save(argThat(g->g.getVisitorId().equals("existing-recall")&&g.getTier()==UserTier.GOLD));
  assertEquals(UserTier.GOLD,old.getBaseTier());
  service.run(null);
  verify(grants,times(3)).save(any());
  verify(solved,times(1)).findAll();
 }
 @Test void chatPresenceUsesPublicHandlesAndRemovesDepartedPeople() {
  var presence=new PresenceService();
  String handle=presence.joinChat("private-visitor-id","nickname");
  assertNotEquals("private-visitor-id",handle);
  assertEquals(handle,presence.joinChat("private-visitor-id","changed"));
  assertEquals("changed",presence.chatMembers().get(0).get("nickname"));
  presence.leaveChat("private-visitor-id");assertTrue(presence.chatMembers().isEmpty());
 }
}
