package com.csstudy.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 사이트의 "자료 기부하기"에서 올린 파일을 GitHub 저장소에 대신 커밋한다.
 * 기부하는 사람은 토큰이 필요 없고, 커밋 권한은 서버의 GITHUB_TOKEN 하나로 처리한다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DonationController {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final String API = "https://api.github.com/repos/";
    private static final String LEDGER = "content/donations.json";

    // 분류값 → 저장소 폴더. 프런트의 KINDS와 같은 값을 쓴다
    private static final Map<String, String> DIRS = Map.of(
            "public", "공기업 필기",
            "major", "전공필기");

    // 공개 엔드포인트라 받을 수 있는 확장자를 자료로 쓸 만한 것으로 제한한다
    private static final Set<String> EXTS = Set.of(
            "pdf", "hwp", "hwpx", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "txt", "md", "csv", "png", "jpg", "jpeg", "gif", "webp", "zip");

    private static final long MAX_BYTES = 20L * 1024 * 1024;
    private static final int PER_VISITOR_PER_DAY = 10;

    // 하루치 업로드 횟수. 서버가 재시작되면 초기화되는 가벼운 방어선이다
    private final Map<String, int[]> quota = new ConcurrentHashMap<>();

    private final RestTemplate restTemplate;

    @Value("${github.token:}")
    private String token;

    @Value("${github.repo:AnChanUng/cs-study-platform}")
    private String repo;

    @Value("${github.branch:master}")
    private String branch;

    @PostMapping(value = "/donations", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> donate(@RequestPart("file") MultipartFile file,
                                      @RequestPart(value = "kind", required = false) String kind,
                                      @RequestPart(value = "label", required = false) String label,
                                      @RequestPart(value = "note", required = false) String note,
                                      @RequestHeader(value = "X-Visitor-Id", required = false) String visitorId) {

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "서버에 GitHub 토큰이 설정되지 않아 지금은 기부를 받을 수 없습니다.");
        }
        if (file == null || file.isEmpty()) bad("올릴 파일이 없습니다.");
        if (file.getSize() > MAX_BYTES) bad("파일이 너무 큽니다. 20MB 이하만 올릴 수 있습니다.");

        String dir = DIRS.get(kind == null ? "public" : kind);
        if (dir == null) bad("자료 분류가 올바르지 않습니다.");

        String name = safeName(file.getOriginalFilename());
        String ext = ext(name);
        if (!EXTS.contains(ext)) bad("올릴 수 없는 형식입니다. PDF·HWP·문서·이미지·압축 파일만 받습니다.");

        String title = trim(label, 120);
        if (title.isBlank()) bad("자료 이름을 적어 주세요.");

        checkQuota(visitorId);

        // 같은 이름이 이미 있으면 덮어쓰지 않고 날짜를 붙여 새 파일로 남긴다
        String path = dir + "/" + name;
        if (sha(path) != null) {
            int dot = name.lastIndexOf('.');
            String today = LocalDate.now(KST).toString();
            path = dir + "/" + (dot < 0 ? name + "_" + today
                    : name.substring(0, dot) + "_" + today + name.substring(dot));
        }

        String content = Base64.getEncoder().encodeToString(bytes(file));
        put(path, content, "자료 기부: " + title, null);

        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("at", Instant.now().toString());
        entry.put("kind", kind == null ? "public" : kind);
        entry.put("label", title);
        entry.put("note", trim(note, 200));
        entry.put("path", path);
        entry.put("size", file.getSize());
        entry.put("handled", false);
        appendToLedger(entry, title);

        log.info("자료 기부 접수: {} ({} bytes)", path, file.getSize());

        return Map.of("ok", true, "path", path,
                "url", "https://github.com/" + repo + "/blob/" + branch + "/" + path);
    }

    /** 기부 장부. 토큰 없이도 읽히도록 GET으로 열어 둔다 */
    @GetMapping("/donations")
    public List<?> list() {
        Object parsed = readLedger();
        return parsed instanceof List<?> l ? l : List.of();
    }

    // ===== GitHub contents API =====

    private HttpHeaders headers() {
        HttpHeaders h = new HttpHeaders();
        h.set(HttpHeaders.ACCEPT, "application/vnd.github+json");
        h.setBearerAuth(token);
        h.set("X-GitHub-Api-Version", "2022-11-28");
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    private String contentsUrl(String path) {
        StringBuilder sb = new StringBuilder(API).append(repo).append("/contents/");
        String[] parts = path.split("/");
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) sb.append('/');
            sb.append(java.net.URLEncoder.encode(parts[i], StandardCharsets.UTF_8).replace("+", "%20"));
        }
        return sb.toString();
    }

    /** 파일이 있으면 sha를, 없으면 null을 준다 */
    @SuppressWarnings("unchecked")
    private String sha(String path) {
        try {
            ResponseEntity<Map> res = restTemplate.exchange(
                    contentsUrl(path) + "?ref=" + branch, HttpMethod.GET,
                    new HttpEntity<>(headers()), Map.class);
            Object s = res.getBody() == null ? null : res.getBody().get("sha");
            return s == null ? null : s.toString();
        } catch (Exception e) {
            return null; // 404 포함
        }
    }

    private void put(String path, String base64, String message, String sha) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        body.put("content", base64);
        body.put("branch", branch);
        if (sha != null) body.put("sha", sha);
        try {
            restTemplate.exchange(contentsUrl(path), HttpMethod.PUT,
                    new HttpEntity<>(body, headers()), Map.class);
        } catch (Exception e) {
            log.error("GitHub 커밋 실패: {}", path, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub에 저장하지 못했습니다.");
        }
    }

    @SuppressWarnings("unchecked")
    private Object readLedger() {
        try {
            HttpHeaders h = headers();
            h.set(HttpHeaders.ACCEPT, "application/vnd.github.raw");
            ResponseEntity<String> res = restTemplate.exchange(
                    contentsUrl(LEDGER) + "?ref=" + branch, HttpMethod.GET,
                    new HttpEntity<>(h), String.class);
            return new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(res.getBody() == null ? "[]" : res.getBody(), List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    private void appendToLedger(Map<String, Object> entry, String title) {
        try {
            Object cur = readLedger();
            List<Object> list = new ArrayList<>(cur instanceof List<?> l ? l : List.of());
            list.add(entry);
            String json = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writerWithDefaultPrettyPrinter().writeValueAsString(list) + "\n";
            put(LEDGER, Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8)),
                    "자료 기부 장부: " + title, sha(LEDGER));
        } catch (Exception e) {
            // 파일은 이미 올라갔으므로 장부 실패로 기부 자체를 되돌리지는 않는다
            log.warn("기부 장부 갱신 실패", e);
        }
    }

    // ===== 잡다한 검사 =====

    private void checkQuota(String visitorId) {
        String key = (visitorId == null || visitorId.isBlank() ? "anon" : trim(visitorId, 40))
                + "|" + LocalDate.now(KST);
        int[] n = quota.computeIfAbsent(key, k -> new int[1]);
        synchronized (n) {
            if (++n[0] > PER_VISITOR_PER_DAY) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "오늘은 더 올릴 수 없습니다. 내일 다시 시도해 주세요.");
            }
        }
    }

    private byte[] bytes(MultipartFile f) {
        try {
            return f.getBytes();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일을 읽지 못했습니다.");
        }
    }

    private static String safeName(String raw) {
        String n = raw == null ? "donation" : raw.trim();
        n = n.replaceAll("[\\\\/:*?\"<>|]", "_").replaceAll("\\s+", " ");
        if (n.startsWith(".")) n = "_" + n;
        return n.length() > 120 ? n.substring(n.length() - 120) : n;
    }

    private static String ext(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static String trim(String s, int max) {
        if (s == null) return "";
        String t = s.trim();
        return t.length() > max ? t.substring(0, max) : t;
    }

    private static void bad(String message) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
