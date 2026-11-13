package com.csstudy.backend.service;

import com.csstudy.backend.entity.AuthToken;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.AuthTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String BEARER = "Bearer ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AuthTokenRepository authTokenRepository;

    @Transactional
    public String issueToken(User user) {
        String token = newToken();
        authTokenRepository.save(AuthToken.builder().tokenHash(hash(token)).user(user).build());
        return token;
    }

    static String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional
    public void revoke(HttpServletRequest request) {
        extractToken(request).ifPresent(token -> authTokenRepository.deleteByTokenHash(hash(token)));
    }

    @Transactional
    public void revokeAll(User user) {
        authTokenRepository.deleteAllForUser(user.getId());
    }

    /** 로그인하지 않은 요청이면 비어 있다. */
    public Optional<User> currentUser(HttpServletRequest request) {
        return extractToken(request)
                .flatMap(token -> authTokenRepository.findByTokenHash(hash(token)))
                .map(AuthToken::getUser);
    }

    public User requireUser(HttpServletRequest request) {
        return currentUser(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."));
    }

    private Optional<String> extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER)) {
            return Optional.empty();
        }
        String token = header.substring(BEARER.length()).trim();
        return token.isEmpty() ? Optional.empty() : Optional.of(token);
    }

    static String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
