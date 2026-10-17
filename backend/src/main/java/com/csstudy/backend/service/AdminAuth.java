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
    @Value("${app.security.min-admin-key-length:32}")
    private int minimumKeyLength = 32;

    // An unset key closes administrator APIs. There is no public fallback credential.
    public void require(String key) {
        if (adminKey == null || adminKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ADMIN_KEY가 설정되지 않았습니다.");
        }
        if (adminKey.length() < minimumKeyLength) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ADMIN_KEY를 32자 이상의 무작위 값으로 설정해 주세요.");
        }
        if (key == null || !MessageDigest.isEqual(
                key.getBytes(StandardCharsets.UTF_8), adminKey.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "관리자 키가 올바르지 않습니다.");
        }
    }
}
