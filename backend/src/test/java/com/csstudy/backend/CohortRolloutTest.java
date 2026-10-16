package com.csstudy.backend;
import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import com.csstudy.backend.service.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.mockito.Mockito.*;
class CohortRolloutTest {
    @Test void snapshotsExistingGoldIncludingPromotedMembersOnlyOnce() {
        var rollout=mock(MembershipRolloutRepository.class);var users=mock(UserRepository.class);
        var grants=mock(VisitorTierGrantRepository.class);var solved=mock(VisitorSolvedRepository.class);
        var cohorts=mock(CohortService.class);var done=new AtomicBoolean();
        when(rollout.existsById(2L)).thenAnswer(a->done.get());
        when(rollout.save(any())).thenAnswer(a->{done.set(true);return a.getArgument(0);});
        when(users.findAll()).thenReturn(List.of(User.builder().id(1L).baseTier(UserTier.GOLD).build(),
                User.builder().id(2L).baseTier(UserTier.BRONZE).build(),User.builder().id(3L).build()));
        when(grants.findAll()).thenReturn(List.of(new VisitorTierGrant("old-guest",UserTier.GOLD),new VisitorTierGrant("new-guest",UserTier.SILVER)));
        // Promoted GOLD users still belong to the same cohort regardless of current solved count.
        when(solved.findAll()).thenReturn(List.of(VisitorSolved.builder().visitorId("old-guest").userId(1L).count(1000).build()));
        var service=new CohortRolloutService(rollout,users,grants,solved,cohorts);
        service.run(null);service.run(null);
        verify(cohorts).captureUser(1L);verify(cohorts).captureUser(3L);
        verify(cohorts).captureVisitor("old-guest",1L);verifyNoMoreInteractions(cohorts);
        verify(users,times(1)).findAll();
    }
}
