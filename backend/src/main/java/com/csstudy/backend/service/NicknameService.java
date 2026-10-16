package com.csstudy.backend.service;
import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;

@Service @RequiredArgsConstructor
public class NicknameService {
    private final NicknameClaimRepository claims;
    private final UserRepository users;
    private final VisitorProfileRepository profiles;
    private final VisitorSolvedRepository solved;
    private final ApplicationEventPublisher events;
    private final CohortService cohort;
    private final TierAwardService tierAwards;
    public record Changed(Long userId) {}
    public static String key(String name) { return java.text.Normalizer.normalize(name,java.text.Normalizer.Form.NFKC).replaceAll("\\s+"," ").trim().toLowerCase(Locale.ROOT); }
    public static String validate(String name) {
        String clean=name==null?"":name.replaceAll("[\\p{Cntrl}<>]","").replaceAll("\\s+"," ").trim();
        if(clean.isBlank() || clean.length()>20) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"닉네임은 1~20자로 입력해 주세요.");
        return clean;
    }
    @Transactional
    public User register(String name,String password,UserTier base,String visitorId) {
        String clean=validate(name);
        User user=users.saveAndFlush(User.builder().nickname(clean).password(password).baseTier(base).build());
        claim(clean,"u:"+user.getId(),visitorId);
        cohort.attachVisitorAccount(visitorId,user.getId());
        tierAwards.attachVisitorAccount(visitorId,user.getId());
        return user;
    }
    @Transactional
    public User rename(User existing,String name,String visitorId) {
        User user=users.findForNicknameUpdate(existing.getId()).orElseThrow();
        String clean=validate(name),owner="u:"+user.getId(),old=user.getNickname();
        claim(clean,owner,visitorId);
        user.setNickname(clean);users.saveAndFlush(user);
        release(old,clean,owner);
        // Update this account's linked visitor aliases, retaining their progress and eligibility.
        var ids=new java.util.HashSet<String>();
        solved.findByUserId(user.getId()).forEach(v->ids.add(v.getVisitorId()));
        if(visitorId!=null)ids.add(visitorId);
        profiles.findByVisitorIdIn(ids).forEach(p->{p.setNickname(clean);profiles.save(p);});
        events.publishEvent(new Changed(user.getId()));
        return user;
    }
    @Transactional
    public void visitor(String visitorId,String name,Long userId) {
        String owner=userId==null?"v:"+visitorId:"u:"+userId;
        String old=profiles.findByVisitorId(visitorId).map(VisitorProfile::getNickname).orElse(null);
        claim(name,owner,visitorId);release(old,name,owner);
    }
    private void claim(String name,String owner,String visitorId) {
        String key=key(name);
        var existing=claims.findById(key);
        if(existing.isPresent() && existing.get().getOwner().equals(owner)) return;
        for(User u:users.findAll()) {
            if(key(u.getNickname()).equals(key) && !owner.equals("u:"+u.getId())) conflict();
        }
        for(VisitorProfile p:profiles.findAll()) {
            if(!key(p.getNickname()).equals(key) || p.getVisitorId().equals(visitorId)) continue;
            boolean sameAccount=owner.startsWith("u:") && solved.findByVisitorId(p.getVisitorId()).map(v->owner.equals("u:"+v.getUserId())).orElse(false);
            if(!sameAccount) conflict();
        }
        if(existing.isPresent() && !existing.get().getOwner().equals(owner)
                && !(owner.startsWith("u:") && existing.get().getOwner().equals("v:"+visitorId))) conflict();
        if(existing.isEmpty()) claims.insertClaim(key,owner);
        else if(!existing.get().getOwner().equals(owner)) {
            existing.get().setOwner(owner);claims.saveAndFlush(existing.get());
        }
    }
    private void release(String old,String name,String owner) {
        if(old==null||key(old).equals(key(name)))return;
        claims.findById(key(old)).filter(c->c.getOwner().equals(owner)).ifPresent(claims::delete);
    }
    private void conflict(){throw new ResponseStatusException(HttpStatus.CONFLICT,"이미 사용 중인 닉네임입니다.");}
}
