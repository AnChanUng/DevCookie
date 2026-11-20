package com.csstudy.backend.service;

import com.csstudy.backend.entity.DevLogEntry;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.DevLogEntryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

// 팀 개발 일지: 읽기는 누구나, 쓰기는 허용 목록(app.devlog.editors, 닉네임)에 있는 로그인 계정만
@Service
public class DevLogService {

    static final int MAX_ITEMS = 30, MAX_SUB = 20, MAX_TEXT = 200, MAX_NOTE = 1000;
    private static final TypeReference<List<Map<String, Object>>> ITEMS = new TypeReference<>() {};

    private final DevLogEntryRepository entries;
    private final ObjectMapper json;
    private final Set<String> editors;

    public DevLogService(DevLogEntryRepository entries, ObjectMapper json, @Value("${app.devlog.editors:}") String editors) {
        this.entries = entries;
        this.json = json;
        this.editors = new HashSet<>();
        for (String name : editors.split(",")) if (!name.isBlank()) this.editors.add(name.trim());
    }

    public boolean canEdit(Optional<User> user) {
        return user.map(u -> editors.contains(u.getNickname())).orElse(false);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list() {
        return entries.findTop60ByOrderByLogDateDesc().stream().map(this::view).toList();
    }

    @Transactional
    public Map<String, Object> save(LocalDate date, Map<String, Object> body, User user) {
        requireEditor(user);
        String title = text(body.get("title"), 80, "제목");
        String owner = optional(body.get("owner"), 40);
        List<Map<String, Object>> items = clean(body.get("items"));
        Long version = body.get("version") instanceof Number n ? n.longValue() : null;

        DevLogEntry entry = entries.findByLogDate(date).orElse(null);
        if (entry == null) {
            entry = new DevLogEntry();
            entry.setLogDate(date);
        } else if (version == null || !version.equals(entry.getVersion())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "다른 사람이 먼저 고쳤어요. 새로고침한 뒤 다시 저장해 주세요.");
        }
        entry.setTitle(title);
        entry.setOwner(owner);
        entry.setItemsJson(write(items));
        entry.setUpdatedAt(Instant.now());
        entry.setUpdatedBy(user.getNickname());
        return view(entries.saveAndFlush(entry));
    }

    @Transactional
    public void delete(LocalDate date, User user) {
        requireEditor(user);
        entries.findByLogDate(date).ifPresent(entries::delete);
    }

    private void requireEditor(User user) {
        if (!canEdit(Optional.of(user))) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "개발 일지를 고칠 권한이 없어요.");
    }

    // 할 일이 하나 이상 있고, 맨 아래 칸(하위 항목이 있으면 하위 항목, 없으면 그 항목)이 모두 완료면 완료
    @SuppressWarnings("unchecked")
    static boolean complete(List<Map<String, Object>> items) {
        int leaves = 0;
        for (Map<String, Object> item : items) {
            List<Map<String, Object>> sub = (List<Map<String, Object>>) item.get("sub");
            for (Map<String, Object> leaf : sub.isEmpty() ? List.of(item) : sub) {
                leaves++;
                if (!Boolean.TRUE.equals(leaf.get("done"))) return false;
            }
        }
        return leaves > 0;
    }

    // 받은 목록을 정해진 모양과 길이로 다시 만든다(모르는 필드는 버린다)
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> clean(Object raw) {
        if (!(raw instanceof List<?> list)) throw bad("할 일 목록이 비어 있거나 형식이 맞지 않아요.");
        if (list.size() > MAX_ITEMS) throw bad("할 일은 하루 " + MAX_ITEMS + "개까지 적을 수 있어요.");
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object o : list) {
            if (!(o instanceof Map<?, ?> m)) throw bad("할 일 형식이 맞지 않아요.");
            Map<String, Object> item = leaf((Map<String, Object>) m);
            List<Map<String, Object>> sub = new ArrayList<>();
            if (m.get("sub") instanceof List<?> subs) {
                if (subs.size() > MAX_SUB) throw bad("하위 항목은 " + MAX_SUB + "개까지 적을 수 있어요.");
                for (Object s : subs) {
                    if (!(s instanceof Map<?, ?> sm)) throw bad("하위 항목 형식이 맞지 않아요.");
                    sub.add(leaf((Map<String, Object>) sm));
                }
            }
            item.put("sub", sub);
            out.add(item);
        }
        return out;
    }

    private Map<String, Object> leaf(Map<String, Object> m) {
        Map<String, Object> out = new LinkedHashMap<>();
        String id = optional(m.get("id"), 24);
        out.put("id", id != null && id.matches("[A-Za-z0-9_-]+") ? id : UUID.randomUUID().toString().substring(0, 8));
        out.put("text", text(m.get("text"), MAX_TEXT, "할 일"));
        String note = optional(m.get("note"), MAX_NOTE);
        if (note != null) out.put("note", note);
        out.put("done", Boolean.TRUE.equals(m.get("done")));
        return out;
    }

    private Map<String, Object> view(DevLogEntry e) {
        List<Map<String, Object>> items = read(e.getItemsJson());
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("date", e.getLogDate().toString());
        out.put("title", e.getTitle());
        out.put("owner", e.getOwner());
        out.put("items", items);
        out.put("complete", complete(items));
        out.put("version", e.getVersion());
        out.put("updatedAt", e.getUpdatedAt());
        out.put("updatedBy", e.getUpdatedBy());
        return out;
    }

    private List<Map<String, Object>> read(String raw) {
        try { return json.readValue(raw, ITEMS); } catch (JsonProcessingException e) { return List.of(); }
    }

    private String write(List<Map<String, Object>> items) {
        try {
            String s = json.writeValueAsString(items);
            if (s.length() > 40000) throw bad("하루 기록이 너무 길어요. 나눠서 적어 주세요.");
            return s;
        } catch (JsonProcessingException e) { throw bad("할 일 목록을 저장하지 못했어요."); }
    }

    private static String text(Object v, int max, String label) {
        String s = optional(v, max);
        if (s == null) throw bad(label + "을(를) 입력해 주세요.");
        return s;
    }

    private static String optional(Object v, int max) {
        if (!(v instanceof String s) || s.isBlank()) return null;
        String t = s.trim();
        return t.length() > max ? t.substring(0, max) : t;
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
