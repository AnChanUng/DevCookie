package com.csstudy.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class AdminAuth {

    @Value("${app.admin-key:}")
    private String adminKey;

    // ADMIN_KEY 환경변수를 설정하지 않은 서버에서는 관리자 조회가 아예 열리지 않는다
    public void require(String key) {
        if (adminKey == null || adminKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ADMIN_KEY가 설정되지 않았습니다.");
        }
        if (key == null || !MessageDigest.isEqual(
                key.getBytes(StandardCharsets.UTF_8), adminKey.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 키가 올바르지 않습니다.");
        }
    }
}
