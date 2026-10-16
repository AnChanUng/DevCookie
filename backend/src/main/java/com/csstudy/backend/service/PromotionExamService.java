package com.csstudy.backend.service;

import com.csstudy.backend.entity.*;
import com.csstudy.backend.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.*;

@Service @RequiredArgsConstructor
public class PromotionExamService {
    private final ObjectMapper json;
    private final PromotionAttemptRepository attempts;
    private final TierAwardRepository awards;
    private final AuthService auth;
    private final MembershipService membership;
    private final PromotionNoticeService notices;
    private List<Question> bank;
    private static final Map<String,Integer> DRAW = Map.of("os",6,"net",6,"db",6,"arch",6,"c",2,"java",2,"python",2);
    public record Question(String id,String group,String topic,String q,String code,List<String> o,int a,String e) {}
    public record PaperQuestion(String id,String group,String topic,String q,String code,List<String> o) {}
    public record Paper(String id,List<PaperQuestion> questions, Object result) {}
    public record Review(String id,int answer,int selected,boolean correct,String explanation) {}
    public record Result(int correct,int total,double score,boolean passed,boolean promoted,String tierName,List<Review> review) {}
    @PostConstruct void loadBank() throws Exception {
        try(var input=new ClassPathResource("promotion-bank.json").getInputStream()) {
            bank=json.readValue(input,new TypeReference<List<Question>>(){});
        }
        for(var draw:DRAW.entrySet()) if(bank.stream().filter(q->q.group().equals(draw.getKey())).count()<draw.getValue())
            throw new IllegalStateException("Insufficient promotion exam pool: "+draw.getKey());
    }
    private String subject(HttpServletRequest request) {
        if(request.getHeader("Authorization")!=null) return "user:"+auth.requireUser(request).getId();
        String id=request.getHeader("X-Visitor-Id");
        if(id==null || id.isBlank() || id.length()>40) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"방문자 정보를 확인해 주세요.");
        return "visitor:"+id;
    }
    @Transactional
    public Paper start(HttpServletRequest request) throws Exception {
        String key=subject(request);
        if(!awards.existsById(key)) awards.saveAndFlush(new TierAward(key,-1));
        List<Question> selected=new ArrayList<>();
        for(var draw:DRAW.entrySet()) {
            var pool=new ArrayList<>(bank.stream().filter(q->q.group().equals(draw.getKey())).toList());
            Collections.shuffle(pool); selected.addAll(pool.subList(0,draw.getValue()));
        }
        Collections.shuffle(selected);
        var attempt=attempts.save(PromotionAttempt.builder().id(UUID.randomUUID().toString()).subjectKey(key)
                .questions(json.writeValueAsString(selected)).startedAt(Instant.now()).build());
        return paper(attempt);
    }
    @Transactional(readOnly=true)
    public Paper get(String id,HttpServletRequest request) throws Exception {
        return paper(attempts.findByIdAndSubjectKey(id,subject(request)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }
    private List<Question> questions(PromotionAttempt attempt) throws Exception {
        return json.readValue(attempt.getQuestions(),new TypeReference<List<Question>>(){});
    }
    private Paper paper(PromotionAttempt attempt) throws Exception {
        return new Paper(attempt.getId(),questions(attempt).stream()
                .map(q->new PaperQuestion(q.id(),q.group(),q.topic(),q.q(),q.code(),q.o())).toList(),
                attempt.getResult()==null?null:json.readTree(attempt.getResult()));
    }
    @Transactional
    public Result submit(String id,Map<String,Integer> answers,HttpServletRequest request) throws Exception {
        String key=subject(request);
        var attempt=attempts.findForUpdate(id,key).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        // Return the original result for retries, even if the supplied answers change.
        if(attempt.getResult()!=null) return json.readValue(attempt.getResult(),Result.class);
        List<Question> questions=questions(attempt);
        if(answers==null || answers.size()!=30) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"30문항에 모두 답해 주세요.");
        List<Review> review=new ArrayList<>(); int correct=0;
        for(Question q:questions) {
            Integer answer=answers.get(q.id());
            if(answer==null || answer<0 || answer>=q.o().size()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"답안을 확인해 주세요.");
            boolean right=answer==q.a(); if(right) correct++;
            review.add(new Review(q.id(),q.a(),answer,right,q.e()));
        }
        var award=awards.findForUpdate(key).orElseThrow();
        var current=membership.current(request);
        boolean passed=correct*100>=95*30;
        boolean promoted=passed && current.nextTier()!=null;
        String name=current.tierName();
        if(promoted) {
            int level=current.nextTier().ordinal()*5+5-current.nextDivision();
            award.setTierLevel(Math.max(award.getTierLevel(),level)); awards.save(award);
            name=current.nextTierName();
            notices.announce(key,current,membership.current(request));
        }
        var result=new Result(correct,30,Math.round(correct*1000.0/30)/10.0,passed,promoted,name,review);
        attempt.setResult(json.writeValueAsString(result)); attempts.save(attempt);
        return result;
    }
}
