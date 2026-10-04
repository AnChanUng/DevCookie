package com.csstudy.backend.controller;

import com.csstudy.backend.entity.Duel;
import com.csstudy.backend.entity.DuelPlayer;
import com.csstudy.backend.repository.DuelPlayerRepository;
import com.csstudy.backend.repository.DuelRepository;
import com.csstudy.backend.service.VisitorProfileService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// 1:1 대결. 방을 만든 사람이 고른 문제 번호를 저장해 두고, 링크로 들어온 사람들이 같은 문제를 풀어 점수를 겨룬다.
// 문제 내용과 채점은 프런트에서 하고, 여기서는 문제 번호 목록과 각자의 진행 상황만 맡는다
@RestController
@RequestMapping("/api/v1/duels")
@RequiredArgsConstructor
public class DuelController {

    private static final int MIN_QUESTIONS = 3;
    private static final int MAX_QUESTIONS = 30;
    private static final int MAX_PLAYERS = 20;
    // 헷갈리는 글자(0·O, 1·I·L)는 빼고 방 번호를 만든다
    private static final String CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DuelRepository duelRepository;
    private final DuelPlayerRepository playerRepository;
    private final ObjectMapper json;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) throws JsonProcessingException {
        List<String> ids = questionIds(body);
        if (ids == null) return ResponseEntity.badRequest().body(Map.of("error", "문제 번호를 확인해 주세요. " + MIN_QUESTIONS + "~" + MAX_QUESTIONS + "개여야 합니다."));
        return ResponseEntity.ok(Map.of("code", open(ids).getCode()));
    }

    // 끝난 방에서 "한 판 더"를 누르면 새 방을 열어 이어 준다. 이미 열려 있으면 그 방을 돌려준다
    @PostMapping("/{code}/rematch")
    public ResponseEntity<?> rematch(@PathVariable String code, @RequestBody Map<String, Object> body) throws JsonProcessingException {
        Optional<Duel> found = duelRepository.findByCode(code.toUpperCase());
        if (found.isEmpty()) return ResponseEntity.notFound().build();
        Duel duel = found.get();
        if (duel.getNextCode() == null) {
            List<String> ids = questionIds(body);
            if (ids == null) return ResponseEntity.badRequest().body(Map.of("error", "문제 번호를 확인해 주세요."));
            duel.setNextCode(open(ids).getCode());
            duelRepository.save(duel);
        }
        return ResponseEntity.ok(Map.of("code", duel.getNextCode()));
    }

    private Duel open(List<String> ids) throws JsonProcessingException {
        return duelRepository.save(Duel.builder().code(newCode()).questionIds(json.writeValueAsString(ids)).createdAt(Instant.now()).build());
    }

    // 쓸 수 없는 목록이면 null
    private static List<String> questionIds(Map<String, Object> body) {
        if (!(body.get("questionIds") instanceof List<?> raw) || raw.size() < MIN_QUESTIONS || raw.size() > MAX_QUESTIONS) return null;
        List<String> ids = new ArrayList<>();
        for (Object o : raw) {
            if (!(o instanceof String s) || s.isBlank() || s.length() > 60) return null;
            ids.add(s);
        }
        return ids;
    }

    // 방문자 ID를 헤더로 주면 순위표에서 본인 줄을 표시해 준다
    @GetMapping("/{code}")
    public ResponseEntity<?> get(@PathVariable String code,
                                 @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) throws JsonProcessingException {
        Optional<Duel> found = duelRepository.findByCode(code.toUpperCase());
        if (found.isEmpty()) return ResponseEntity.notFound().build();
        Duel duel = found.get();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("code", duel.getCode());
        out.put("questionIds", json.readValue(duel.getQuestionIds(), new TypeReference<List<String>>() {}));
        out.put("players", board(duel.getCode(), visitorId));
        out.put("nextCode", duel.getNextCode());
        return ResponseEntity.ok(out);
    }

    // 문제를 풀 때마다 본인의 진행 상황을 올린다. 처음 올릴 때 방에 들어온 것으로 친다
    @PutMapping("/{code}/players")
    public ResponseEntity<?> report(@PathVariable String code, @RequestBody Map<String, Object> body) throws JsonProcessingException {
        Optional<Duel> found = duelRepository.findByCode(code.toUpperCase());
        if (found.isEmpty()) return ResponseEntity.notFound().build();
        Duel duel = found.get();
        int total = json.readValue(duel.getQuestionIds(), new TypeReference<List<String>>() {}).size();

        String visitorId = body.get("visitorId") instanceof String s && !s.isBlank() && s.length() <= 40 ? s.trim() : null;
        Integer score = number(body.get("score"), total);
        Integer answered = number(body.get("answered"), total);
        Integer seconds = number(body.get("seconds"), 24 * 60 * 60);
        // 문제별 정오답은 보내지 않아도 되지만, 보냈다면 답한 수 · 맞힌 수와 맞아야 한다
        String marks = body.get("marks") instanceof String m && m.matches("[01]*") ? m : null;
        boolean marksOk = marks == null || (answered != null && score != null
                && marks.length() == answered && marks.chars().filter(ch -> ch == '1').count() == score);
        if (visitorId == null || score == null || answered == null || seconds == null || score > answered || !marksOk) {
            return ResponseEntity.badRequest().body(Map.of("error", "진행 상황을 확인해 주세요."));
        }
        String nickname = VisitorProfileService.nickname(body.get("nickname"));
        if (nickname == null) nickname = VisitorProfileService.anonymous(visitorId);

        Optional<DuelPlayer> existing = playerRepository.findByDuelCodeAndVisitorId(duel.getCode(), visitorId);
        if (existing.isEmpty() && playerRepository.countByDuelCode(duel.getCode()) >= MAX_PLAYERS) {
            return ResponseEntity.badRequest().body(Map.of("error", "이 대결은 정원이 찼습니다."));
        }
        DuelPlayer player = existing.orElseGet(() -> DuelPlayer.builder().duelCode(duel.getCode()).visitorId(visitorId).build());
        // 이미 끝낸 사람의 기록은 다시 고치지 못하게 한다
        if (!player.isDone()) {
            player.setNickname(nickname);
            player.setScore(score);
            player.setAnswered(answered);
            player.setSeconds(seconds);
            if (marks != null) player.setMarks(marks);
            player.setDone(Boolean.TRUE.equals(body.get("done")) && answered == total);
            player.setUpdatedAt(Instant.now());
            try {
                playerRepository.save(player);
            } catch (DataIntegrityViolationException e) {
                // 같은 사람의 요청이 겹쳤다. 먼저 들어간 값을 그대로 둔다
            }
        }
        return ResponseEntity.ok(Map.of("players", board(duel.getCode(), visitorId)));
    }

    // 점수가 높은 순, 같으면 빨리 푼 순
    private List<Map<String, Object>> board(String code, String visitorId) {
        List<DuelPlayer> players = new ArrayList<>(playerRepository.findByDuelCode(code));
        players.sort(Comparator.comparingInt(DuelPlayer::getScore).reversed()
                .thenComparingInt(DuelPlayer::getSeconds)
                .thenComparing(DuelPlayer::getId));
        List<Map<String, Object>> rows = new ArrayList<>();
        // 아직 풀고 있는 사람에게는 문제별 정오답을 보여 주지 않는다
        boolean reveal = visitorId != null && players.stream().anyMatch(p -> p.getVisitorId().equals(visitorId) && p.isDone());
        for (DuelPlayer p : players) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("nickname", p.getNickname());
            row.put("score", p.getScore());
            row.put("answered", p.getAnswered());
            row.put("done", p.isDone());
            row.put("seconds", p.getSeconds());
            row.put("me", p.getVisitorId().equals(visitorId));
            row.put("marks", reveal && p.isDone() ? p.getMarks() : null);
            rows.add(row);
        }
        return rows;
    }

    private static Integer number(Object value, int max) {
        return value instanceof Number n && n.intValue() >= 0 && n.intValue() <= max ? n.intValue() : null;
    }

    private String newCode() {
        while (true) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < CODE_LENGTH; i++) sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            String code = sb.toString();
            if (!duelRepository.existsByCode(code)) return code;
        }
    }
}
