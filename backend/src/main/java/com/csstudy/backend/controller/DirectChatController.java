package com.csstudy.backend.controller;

import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import com.csstudy.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/direct")
@RequiredArgsConstructor
@Transactional
public class DirectChatController {
    private final AuthService auth;
    private final UserRepository users;
    private final DirectThreadRepository threads;
    private final DirectMessageRepository messages;

    private DirectThread owned(Long id, Long me) {
        DirectThread t = threads.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!me.equals(t.getLowUser()) && !me.equals(t.getHighUser())) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return t;
    }
    private Map<String,Object> row(DirectThread t, Long me) {
        Long peer = me.equals(t.getLowUser()) ? t.getHighUser() : t.getLowUser();
        String state = t.isFriends() ? "friends" : t.getRequestedBy() == null ? "none" : me.equals(t.getRequestedBy()) ? "sent" : "received";
        return Map.of("id",t.getId(),"nickname",users.findById(peer).map(User::getNickname).orElse("탈퇴한 사용자"),"friendship",state,"unread",messages.countByThreadIdAndSenderIdNotAndReadAtIsNull(t.getId(),me));
    }
    @GetMapping
    public List<Map<String,Object>> inbox(HttpServletRequest request) {
        Long me = auth.requireUser(request).getId();
        return threads.findByLowUserOrHighUserOrderByIdDesc(me,me).stream().map(t -> row(t,me)).toList();
    }
    @PostMapping
    public Map<String,Object> start(@RequestBody Map<String,String> body, HttpServletRequest request) {
        Long me = auth.requireUser(request).getId();
        String name = body.getOrDefault("nickname","").trim();
        User peer = users.findByNickname(name).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"로그인 계정으로 등록된 닉네임을 찾을 수 없습니다."));
        if (peer.getId().equals(me)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"본인에게 요청할 수 없습니다.");
        Long low = Math.min(me,peer.getId()), high = Math.max(me,peer.getId());
        // Lock the stable pair endpoint before creating a unique thread.
        users.findForUpdate(low).orElseThrow();
        DirectThread t = threads.findByLowUserAndHighUser(low,high).orElseGet(() -> {
            DirectThread created = new DirectThread(); created.setLowUser(low); created.setHighUser(high);
            return threads.saveAndFlush(created);
        });
        return row(t,me);
    }
    @PostMapping("/{id}/friend")
    public Map<String,Object> friendship(@PathVariable Long id, @RequestBody Map<String,String> body, HttpServletRequest request) {
        Long me = auth.requireUser(request).getId();
        DirectThread initial = owned(id,me);
        users.findForUpdate(initial.getLowUser()).orElseThrow();
        // Refresh after locking to observe a concurrently committed request.
        entityManager.refresh(initial);
        String action = body.getOrDefault("action","");
        switch (action) {
            case "request" -> { if (!initial.isFriends() && initial.getRequestedBy()==null) initial.setRequestedBy(me); }
            case "accept" -> {
                if (initial.getRequestedBy()==null || me.equals(initial.getRequestedBy())) throw new ResponseStatusException(HttpStatus.CONFLICT);
                initial.setFriends(true); initial.setRequestedBy(null);
            }
            case "remove" -> { initial.setFriends(false); initial.setRequestedBy(null); }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        return row(initial,me);
    }
    private final jakarta.persistence.EntityManager entityManager;

    @GetMapping("/{id}/messages")
    public List<Map<String,Object>> history(@PathVariable Long id, HttpServletRequest request) {
        Long me=auth.requireUser(request).getId(); owned(id,me);
        List<DirectMessage> rows = new ArrayList<>(messages.findTop100ByThreadIdOrderByIdDesc(id));
        Collections.reverse(rows);
        return rows.stream().map(m -> Map.<String,Object>of("id",m.getId(),"mine",m.getSenderId().equals(me),"text",m.getText(),"at",m.getCreatedAt())).toList();
    }
    @PostMapping("/{id}/read")
    public Map<String,Boolean> read(@PathVariable Long id,@RequestBody Map<String,Long> body,HttpServletRequest request) {
        Long me=auth.requireUser(request).getId(); owned(id,me);
        messages.markRead(id,me,body.getOrDefault("last",0L),Instant.now());
        return Map.of("ok",true);
    }
    @PostMapping("/{id}/messages")
    public Map<String,Long> send(@PathVariable Long id,@RequestBody Map<String,String> body,HttpServletRequest request) {
        Long me=auth.requireUser(request).getId(); owned(id,me);
        String text=body.getOrDefault("text","").trim(), client=body.getOrDefault("clientId","");
        if(text.isBlank() || text.length()>1000 || !client.matches("[a-zA-Z0-9-]{1,36}")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        users.findForUpdate(me).orElseThrow();
        var previous=messages.findBySenderIdAndClientId(me,client);
        if(previous.isPresent()) {
            if(!previous.get().getThreadId().equals(id))throw new ResponseStatusException(HttpStatus.CONFLICT);
            return Map.of("id",previous.get().getId());
        }
        if(messages.findTopBySenderIdOrderByIdDesc(me).filter(m -> m.getCreatedAt().isAfter(Instant.now().minusSeconds(1))).isPresent()) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS);
        DirectMessage m=new DirectMessage();m.setThreadId(id);m.setSenderId(me);m.setClientId(client);m.setText(text);m.setCreatedAt(Instant.now());
        return Map.of("id",messages.save(m).getId());
    }
}
