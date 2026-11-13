package com.csstudy.backend.service;

import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AccountRecoveryService {
    private static final Duration LINK_LIFETIME = Duration.ofMinutes(15);
    private static final Duration RESEND_DELAY = Duration.ofMinutes(1);
    private static final Pattern TOKEN = Pattern.compile("[A-Za-z0-9_-]{43}");
    private static final Pattern EMAIL = Pattern.compile("[^\\s@,<>]+@[^\\s@,<>.]+(?:\\.[^\\s@,<>.]+)+");
    private final UserRepository users;
    private final AuthService auth;
    private final EntityManager entityManager;
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();

    public record EmailLink(String recipient, String token) {}

    @Transactional
    public EmailLink prepareVerification(Long userId, String email, String password) {
        if (email.length() > 254 || !EMAIL.matcher(email).matches()) {
            throw badRequest("올바른 이메일 주소를 입력해 주세요.");
        }
        User user = users.findForUpdate(userId).orElseThrow();
        // Authentication may already have loaded this user before acquiring the lock.
        entityManager.refresh(user);
        if (password.isEmpty() || !passwords.matches(password, user.getPassword())) {
            throw badRequest("현재 비밀번호를 확인해 주세요.");
        }
        Instant now = Instant.now();
        if (coolingDown(user.getRecoveryVerificationExpiresAt(), now)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "1분 뒤 다시 요청해 주세요.");
        }
        String token = AuthService.newToken();
        user.setPendingRecoveryEmail(email);
        user.setRecoveryVerificationHash(AuthService.hash(token));
        user.setRecoveryVerificationExpiresAt(now.plus(LINK_LIFETIME));
        return new EmailLink(email, token);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = users.findByRecoveryVerificationHash(tokenHash(token)).orElseThrow(this::invalidLink);
        if (!active(user.getRecoveryVerificationExpiresAt())) throw invalidLink();
        user.setRecoveryEmail(user.getPendingRecoveryEmail());
        clearVerification(user);
        clearReset(user);
    }

    @Transactional
    public EmailLink prepareReset(String nickname) {
        if (nickname.isEmpty()) return null;
        User user = users.findByNicknameForUpdate(nickname).orElse(null);
        Instant now = Instant.now();
        if (user == null || user.getRecoveryEmail() == null || coolingDown(user.getPasswordResetExpiresAt(), now)) {
            return null;
        }
        String token = AuthService.newToken();
        user.setPasswordResetHash(AuthService.hash(token));
        user.setPasswordResetExpiresAt(now.plus(LINK_LIFETIME));
        return new EmailLink(user.getRecoveryEmail(), token);
    }

    @Transactional
    public void resetPassword(String token, String password) {
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw badRequest("새 비밀번호는 8자 이상, UTF-8 기준 72바이트 이하로 입력해 주세요.");
        }
        User user = users.findByPasswordResetHash(tokenHash(token)).orElseThrow(this::invalidLink);
        if (!active(user.getPasswordResetExpiresAt())) throw invalidLink();
        user.setPassword(passwords.encode(password));
        clearReset(user);
        clearVerification(user);
        auth.revokeAll(user);
    }

    private static boolean coolingDown(Instant expiry, Instant now) {
        return expiry != null && now.isBefore(expiry.minus(LINK_LIFETIME).plus(RESEND_DELAY));
    }

    private static boolean active(Instant expiry) {
        return expiry != null && expiry.isAfter(Instant.now());
    }

    private String tokenHash(String token) {
        if (!TOKEN.matcher(token).matches()) throw invalidLink();
        return AuthService.hash(token);
    }

    private static void clearVerification(User user) {
        user.setPendingRecoveryEmail(null);
        user.setRecoveryVerificationHash(null);
        user.setRecoveryVerificationExpiresAt(null);
    }

    private static void clearReset(User user) {
        user.setPasswordResetHash(null);
        user.setPasswordResetExpiresAt(null);
    }

    private ResponseStatusException invalidLink() {
        return badRequest("유효하지 않거나 만료된 링크입니다. 새 링크를 요청해 주세요.");
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
