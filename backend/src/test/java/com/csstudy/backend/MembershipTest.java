package com.csstudy.backend;

import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import com.csstudy.backend.service.MembershipService;
import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.MediaType;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class MembershipTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired ExamProgressRepository progress;
    @Autowired VisitorTierGrantRepository grants;
    @Autowired MembershipService membership;

    private JsonNode register(String name) throws Exception {
        return json.readTree(mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("nickname",name,"password","test-password"))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }
    private void save(User user,int count) throws Exception {
        var root=json.createObjectNode();var stats=root.putObject("stats");
        for(int i=0;i<count;i++)stats.putObject("q"+i).put("c",3).put("w",2);
        stats.putObject("empty").put("c",0).put("w",0);
        var record=progress.findByUserIdAndCompany(user.getId(),"ibkit").orElseGet(()->ExamProgress.builder().user(user).company("ibkit").build());
        record.setData(json.writeValueAsString(root));progress.saveAndFlush(record);
    }
    @Test void tierBoundariesAndExistingGoldArePreserved() {
        assertEquals(UserTier.BRONZE,MembershipService.describe(UserTier.BRONZE,49).tier());
        assertEquals(UserTier.SILVER,MembershipService.describe(UserTier.BRONZE,50).tier());
        assertEquals(UserTier.SILVER,MembershipService.describe(UserTier.BRONZE,199).tier());
        assertEquals(UserTier.DIAMOND,MembershipService.describe(UserTier.BRONZE,200).tier());
        assertEquals(UserTier.DIAMOND,MembershipService.describe(UserTier.GOLD,999).tier());
        assertEquals(UserTier.RUBY,MembershipService.describe(UserTier.GOLD,1000).tier());
        assertEquals(UserTier.GOLD,MembershipService.describe(UserTier.GOLD,0).tier());
        assertEquals(UserTier.GOLD,MembershipService.baseTier(User.builder().build()));
    }
    @Test void accountTierCountsUniqueQuestionsNotAttempts() throws Exception {
        var registered=register("tier-boundary");
        assertEquals("BRONZE",registered.path("membership").path("tier").asText());
        User user=users.findByNickname("tier-boundary").orElseThrow();
        for(int count:new int[]{49,50,199,200,999,1000}) {
            save(user,count);
            var current=membership.membership(user);
            assertEquals(count,current.solvedCount());
            assertEquals(count>=1000?UserTier.RUBY:count>=200?UserTier.DIAMOND:count>=50?UserTier.SILVER:UserTier.BRONZE,current.tier());
        }
        mvc.perform(get("/api/v1/auth/me").header("Authorization","Bearer "+registered.path("token").asText()))
                .andExpect(jsonPath("$.membership.tier").value("RUBY"));
    }
    @Test void theoryRejectsBronzeAndServesGoldVisitorWithoutRegistration() throws Exception {
        mvc.perform(get("/api/v1/theory/notes/sqld-concepts.pdf").header("X-Visitor-Id","new-visitor"))
                .andExpect(status().isForbidden());
        grants.saveAndFlush(new VisitorTierGrant("existing-anonymous",UserTier.GOLD));
        mvc.perform(get("/api/v1/membership").header("X-Visitor-Id","existing-anonymous"))
                .andExpect(jsonPath("$.tier").value("GOLD"));
        mvc.perform(get("/api/v1/theory/notes/sqld-concepts.pdf").header("X-Visitor-Id","existing-anonymous"))
                .andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Cache-Control","no-store"));
        mvc.perform(get("/api/v1/theory/notes/not-allowed.pdf").header("X-Visitor-Id","existing-anonymous"))
                .andExpect(status().isNotFound());
    }
    @Test void renamePreservesTokenTierAndRecordsAndRejectsDuplicate() throws Exception {
        var a=register("rename-first");register("rename-second");
        User user=users.findByNickname("rename-first").orElseThrow();save(user,200);
        String token="Bearer "+a.path("token").asText();
        mvc.perform(put("/api/v1/auth/nickname").header("Authorization",token).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nickname\":\"renamed-first\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nickname").value("renamed-first"));
        mvc.perform(get("/api/v1/auth/me").header("Authorization",token))
                .andExpect(jsonPath("$.id").value(user.getId())).andExpect(jsonPath("$.membership.tier").value("DIAMOND"))
                .andExpect(jsonPath("$.membership.solvedCount").value(200));
        mvc.perform(put("/api/v1/auth/nickname").header("Authorization",token).contentType(MediaType.APPLICATION_JSON)
                .content("{\"nickname\":\"RENAME-SECOND\"}"))
                .andExpect(status().isConflict());
    }
    @Test void guestCannotUseAccountNicknameAndAccountCannotTakeGuestNickname() throws Exception {
        register("unique-account");
        mvc.perform(put("/api/v1/profile").contentType(MediaType.APPLICATION_JSON)
                .content("{\"visitorId\":\"guest-unique-a\",\"nickname\":\"Unique-Account\"}"))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/v1/profile").contentType(MediaType.APPLICATION_JSON)
                .content("{\"visitorId\":\"guest-unique-a\",\"nickname\":\"guest-name\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/v1/profile").contentType(MediaType.APPLICATION_JSON)
                .content("{\"visitorId\":\"guest-unique-b\",\"nickname\":\"GUEST-NAME\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content("{\"nickname\":\"guest-name\",\"password\":\"password\"}"))
                .andExpect(status().isConflict());
    }
}
