package com.csstudy.backend.service;

import com.csstudy.backend.entity.VisitorProfile;
import com.csstudy.backend.repository.VisitorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VisitorProfileService {

    public static final int NICKNAME_MAX = 20;

    private static final String[] ADJECTIVES = {"졸린", "배고픈", "열공하는", "합격할", "씩씩한", "차분한", "든든한", "느긋한"};
    private static final String[] ANIMALS = {"수달", "고양이", "판다", "펭귄", "다람쥐", "올빼미", "거북이", "여우"};

    private final VisitorProfileRepository profileRepository;
    private final NicknameService nicknames;

    // 닉네임을 정하지 않은 방문자에게 붙이는 이름. 같은 방문자는 늘 같은 이름이 나온다
    public static String anonymous(String visitorId) {
        int h = visitorId.hashCode();
        return ADJECTIVES[Math.floorMod(h, ADJECTIVES.length)] + " " + ANIMALS[Math.floorMod(h / ADJECTIVES.length, ANIMALS.length)];
    }

    // 제어 문자와 꺾쇠를 걷어 내고 공백을 하나로 줄인다. 쓸 수 없는 값이면 null
    public static String nickname(Object value) {
        if (!(value instanceof String s)) return null;
        String t = s.replaceAll("[\\p{Cntrl}<>]", "").replaceAll("\\s+", " ").trim();
        if (t.isEmpty()) return null;
        return t.length() > NICKNAME_MAX ? t.substring(0, NICKNAME_MAX) : t;
    }

    // 방문자의 닉네임을 기억해 둔다. 이미 같은 이름이면 아무것도 하지 않는다
    @org.springframework.transaction.annotation.Transactional
    public void remember(String visitorId, String nickname) { remember(visitorId,nickname,null); }

    @org.springframework.transaction.annotation.Transactional
    public void remember(String visitorId, String nickname, Long userId) {
        VisitorProfile profile = profileRepository.findForNicknameUpdate(visitorId)
                .orElseGet(() -> VisitorProfile.builder().visitorId(visitorId).build());
        nicknames.visitor(visitorId,nickname,userId);
        if (nickname.equals(profile.getNickname())) return;
        profile.setNickname(nickname);
        profile.setUpdatedAt(Instant.now());
        try {
            profileRepository.save(profile);
        } catch (DataIntegrityViolationException e) {
            // 같은 방문자의 요청이 겹쳤다. 먼저 들어간 이름을 그대로 둔다
        }
    }

    // 방문자 ID → 닉네임. 닉네임을 정하지 않은 방문자는 들어 있지 않다
    public Map<String, String> nicknames(Collection<String> visitorIds) {
        Map<String, String> out = new HashMap<>();
        if (visitorIds.isEmpty()) return out;
        profileRepository.findByVisitorIdIn(visitorIds).forEach(p -> out.put(p.getVisitorId(), p.getNickname()));
        return out;
    }
}
