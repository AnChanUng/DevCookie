package com.csstudy.backend.controller;

import com.csstudy.backend.entity.Duel;
import com.csstudy.backend.entity.DuelPlayer;
import com.csstudy.backend.repository.DuelPlayerRepository;
import com.csstudy.backend.repository.DuelRepository;
import com.csstudy.backend.service.DuelAnswerKey;
import com.csstudy.backend.service.DuelService;
import com.csstudy.backend.service.VisitorProfileService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// 1:1 대결. 방을 만든 사람이 고른 문제 번호를 저장해 두고, 링크로 들어온 사람들이 같은 문제를 풀어 점수를 겨룬다.
// 문제 내용은 프런트에 있고, 채점은 서버의 정답표(DuelAnswerKey)로 한다. 클라이언트가 보낸 점수는 믿지 않는다
@RestController
@RequestMapping("/api/v1/duels")
@RequiredArgsConstructor
public class DuelController {

    private static final int MIN_QUESTIONS = 3;
    private static final int MAX_QUESTIONS = 30;
    private static final int MAX_PLAYERS = 20;
    // 단체전은 더 많이 들어올 수 있고, 연 지 이만큼 지나면 목록에서 내린다
    private static final int MAX_OPEN_PLAYERS = 100;
    private static final int OPEN_LIST_MINUTES = 120;
    private final DuelRepository duelRepository;
    private final DuelPlayerRepository playerRepository;
    private final DuelService duelService;
    private final DuelAnswerKey answerKey;
    private final ObjectMapper json;

    private boolean active(DuelPlayer p) {
        return !Boolean.FALSE.equals(p.getStarted()) || p.getUpdatedAt().isAfter(Instant.now().minusSeconds(45));
    }

    @GetMapping("/record")
    public Map<String,Object> record(@RequestHeader("X-Visitor-Id") String visitor) {
        int wins=0, losses=0, draws=0;
        List<Map<String,Object>> recent=new ArrayList<>();
        for (DuelPlayer me : playerRepository.findByVisitorIdOrderByUpdatedAtDesc(visitor)) {
            if (!me.isDone()) continue;
            List<DuelPlayer> players=playerRepository.findByDuelCode(me.getDuelCode()).stream().filter(this::active).toList();
            if (players.size()<2 || players.stream().anyMatch(p -> !p.isDone())) continue;
            boolean beaten=players.stream().anyMatch(p -> p.getScore()>me.getScore() || p.getScore()==me.getScore() && p.getSeconds()<me.getSeconds());
            long tied=players.stream().filter(p -> p.getScore()==me.getScore() && p.getSeconds()==me.getSeconds()).count();
            String result=beaten ? "loss" : tied>1 ? "draw" : "win";
            if(beaten) losses++; else if(tied>1) draws++; else wins++;
            if(recent.size()<10) recent.add(Map.of("code",me.getDuelCode(),"result",result,"score",me.getScore(),"seconds",me.getSeconds(),"players",players.size()));
        }
        return Map.of("wins",wins,"losses",losses,"draws",draws,"total",wins+losses+draws,"recent",recent);
    }

    // Entering the room registers presence without starting the quiz or its timer.
    @PostMapping("/{code}/join")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> join(@PathVariable String code, @RequestBody Map<String,Object> body) {
        Optional<Duel> found=duelRepository.findForUpdate(code.toUpperCase());
        if(found.isEmpty()) return ResponseEntity.notFound().build();
        String visitor=body.get("visitorId") instanceof String s && !s.isBlank() && s.length()<=40 ? s.trim() : null;
        if(visitor==null) return ResponseEntity.badRequest().build();
        String nickname=VisitorProfileService.nickname(body.get("nickname"));
        if(nickname==null) nickname=VisitorProfileService.anonymous(visitor);
        String roomCode=found.get().getCode();
        var existing=playerRepository.findByDuelCodeAndVisitorId(roomCode,visitor);
        var participants=playerRepository.findByDuelCode(roomCode).stream().filter(this::active).toList();
        if(existing.isEmpty()) {
            if(participants.size()>=2 && participants.stream().allMatch(DuelPlayer::isDone))
                return ResponseEntity.status(409).body(Map.of("error","종료된 대결입니다. 새 대결 방에 참가해 주세요."));
            int limit=Boolean.TRUE.equals(found.get().getOpen()) ? MAX_OPEN_PLAYERS : MAX_PLAYERS;
            if(participants.size()>=limit) return ResponseEntity.status(409).body(Map.of("error","정원이 찼습니다."));
        }
        DuelPlayer p=existing.orElseGet(() -> DuelPlayer.builder().duelCode(roomCode).visitorId(visitor).started(false).build());
        if(!p.isDone()) { p.setNickname(nickname); p.setUpdatedAt(Instant.now()); }
        try { playerRepository.save(p); } catch(DataIntegrityViolationException ignored) { }
        return ResponseEntity.ok(Map.of("players",board(roomCode,visitor)));
    }

    // Idempotency-Key를 주면 같은 키로 다시 와도 방을 하나만 만든다
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body,
                                    @RequestHeader(value = "Idempotency-Key", required = false) String key) throws JsonProcessingException {
        List<String> ids = questionIds(body);
        if (ids == null) return ResponseEntity.badRequest().body(Map.of("error", "문제 번호를 확인해 주세요. " + MIN_QUESTIONS + "~" + MAX_QUESTIONS + "개여야 합니다."));
        if (key != null && !key.matches("[A-Za-z0-9_-]{8,64}")) return ResponseEntity.badRequest().body(Map.of("error", "요청 키를 확인해 주세요."));
        Duel duel = duelService.create(ids, Boolean.TRUE.equals(body.get("open")), VisitorProfileService.nickname(body.get("title")), key);
        return ResponseEntity.ok(Map.of("code", duel.getCode()));
    }

    // 지금 열려 있는 단체전 목록. 누구나 골라서 들어갈 수 있다
    @GetMapping("/open")
    public List<Map<String, Object>> openRooms() throws JsonProcessingException {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Duel d : duelRepository.findTop20ByOpenTrueAndCreatedAtAfterOrderByCreatedAtDesc(Instant.now().minusSeconds(OPEN_LIST_MINUTES * 60L))) {
            var participants = playerRepository.findByDuelCode(d.getCode()).stream().filter(this::active).toList();
            if (participants.size() >= 2 && participants.stream().allMatch(DuelPlayer::isDone)) continue;
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("code", d.getCode());
            row.put("title", d.getTitle());
            row.put("total", json.readValue(d.getQuestionIds(), new TypeReference<List<String>>() {}).size());
            row.put("players", participants.size());
            row.put("createdAt", d.getCreatedAt().toEpochMilli());
            rows.add(row);
        }
        return rows;
    }

    // 끝난 방에서 "한 판 더"를 누르면 새 방을 열어 이어 준다. 이미 열려 있으면 그 방을 돌려준다(여럿이 동시에 눌러도 한 방)
    @PostMapping("/{code}/rematch")
    public ResponseEntity<?> rematch(@PathVariable String code, @RequestBody Map<String, Object> body) throws JsonProcessingException {
        List<String> ids = questionIds(body);
        if (ids == null) return ResponseEntity.badRequest().body(Map.of("error", "문제 번호를 확인해 주세요."));
        return duelService.rematch(code.toUpperCase(), ids)
                .<ResponseEntity<?>>map(next -> ResponseEntity.ok(Map.of("code", next)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 쓸 수 없는 목록이면 null. 서버 정답표에 없는 문제는 채점할 수 없으므로 받지 않는다
    private List<String> questionIds(Map<String, Object> body) {
        if (!(body.get("questionIds") instanceof List<?> raw) || raw.size() < MIN_QUESTIONS || raw.size() > MAX_QUESTIONS) return null;
        List<String> ids = new ArrayList<>();
        for (Object o : raw) {
            if (!(o instanceof String s) || s.isBlank() || s.length() > 60) return null;
            ids.add(s);
        }
        return answerKey.knowsAll(ids) ? ids : null;
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
        out.put("open", Boolean.TRUE.equals(duel.getOpen()));
        out.put("title", duel.getTitle());
        return ResponseEntity.ok(out);
    }

    // 문제를 풀 때마다 본인의 진행 상황을 올린다. 처음 올릴 때 방에 들어온 것으로 친다
    @PutMapping("/{code}/players")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> report(@PathVariable String code, @RequestBody Map<String, Object> body) throws JsonProcessingException {
        Optional<Duel> found = duelRepository.findForUpdate(code.toUpperCase());
        if (found.isEmpty()) return ResponseEntity.notFound().build();
        Duel duel = found.get();
        List<String> ids = json.readValue(duel.getQuestionIds(), new TypeReference<List<String>>() {});
        int total = ids.size();

        String visitorId = body.get("visitorId") instanceof String s && !s.isBlank() && s.length() <= 40 ? s.trim() : null;
        Integer seconds = number(body.get("seconds"), 24 * 60 * 60);
        // 고른 보기 번호만 받고, 맞힌 수와 정오답은 서버가 계산한다. 클라이언트가 보낸 score · marks는 쓰지 않는다
        String picks = body.get("picks") instanceof String p && p.matches("[0-9]*") ? p : null;
        DuelAnswerKey.Graded graded = answerKey.grade(ids, picks);
        Integer claimed = body.get("answered") == null ? null : number(body.get("answered"), total);
        if (visitorId == null || seconds == null || graded == null
                || (body.get("answered") != null && (claimed == null || claimed != picks.length()))) {
            return ResponseEntity.badRequest().body(Map.of("error", "진행 상황을 확인해 주세요."));
        }
        int answered = picks.length();
        String nickname = VisitorProfileService.nickname(body.get("nickname"));
        if (nickname == null) nickname = VisitorProfileService.anonymous(visitorId);

        Optional<DuelPlayer> existing = playerRepository.findByDuelCodeAndVisitorId(duel.getCode(), visitorId);
        int limit = Boolean.TRUE.equals(duel.getOpen()) ? MAX_OPEN_PLAYERS : MAX_PLAYERS;
        if (existing.isEmpty() && playerRepository.countByDuelCode(duel.getCode()) >= limit) {
            return ResponseEntity.badRequest().body(Map.of("error", "이 대결은 정원이 찼습니다."));
        }
        DuelPlayer player = existing.orElseGet(() -> DuelPlayer.builder().duelCode(duel.getCode()).visitorId(visitorId).build());
        // 이미 끝낸 사람의 기록은 다시 고치지 못하게 한다
        if (!player.isDone()) {
            player.setStarted(true);
            if (answered < player.getAnswered()) return ResponseEntity.ok(Map.of("players", board(duel.getCode(), visitorId)));
            Instant now = Instant.now();
            if (player.getFirstReportAt() == null) player.setFirstReportAt(now);
            // 걸린 시간은 서버가 지켜본 시간보다 짧게 줄일 수 없고, 앞서 올린 시간보다 줄어들지도 않는다
            int observed = (int) java.time.Duration.between(player.getFirstReportAt(), now).getSeconds();
            player.setNickname(nickname);
            player.setScore(graded.score());
            player.setAnswered(answered);
            player.setSeconds(Math.max(seconds, Math.max(observed, player.getSeconds())));
            player.setPicks(picks);
            player.setMarks(graded.marks());
            player.setDone(Boolean.TRUE.equals(body.get("done")) && answered == total);
            player.setUpdatedAt(now);
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
        List<DuelPlayer> players = new ArrayList<>(playerRepository.findByDuelCode(code).stream().filter(this::active).toList());
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
            row.put("started", !Boolean.FALSE.equals(p.getStarted()));
            row.put("online", p.getUpdatedAt().isAfter(Instant.now().minusSeconds(45)));
            row.put("seconds", p.getSeconds());
            row.put("me", p.getVisitorId().equals(visitorId));
            boolean mine = p.getVisitorId().equals(visitorId);
            // 본인 기록은 새로고침 뒤 이어 풀 수 있게 늘 돌려주고, 남의 정오답은 내가 끝낸 뒤에만 보여 준다
            row.put("marks", mine || (reveal && p.isDone()) ? p.getMarks() : null);
            row.put("picks", mine ? p.getPicks() : null);
            rows.add(row);
        }
        return rows;
    }

    private static Integer number(Object value, int max) {
        return value instanceof Number n && n.intValue() >= 0 && n.intValue() <= max ? n.intValue() : null;
    }

}
