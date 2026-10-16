package com.csstudy.backend.controller;

import com.csstudy.backend.dto.UserResponse;
import com.csstudy.backend.entity.User;
import com.csstudy.backend.repository.UserRepository;
import com.csstudy.backend.service.AuthService;
import com.csstudy.backend.service.MembershipService;
import com.csstudy.backend.entity.UserTier;
import com.csstudy.backend.service.NicknameService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final MembershipService membershipService;
    private final NicknameService nicknames;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body, HttpServletRequest request) {
        final String nickname = body.getOrDefault("nickname", "").trim();
        final String password = body.getOrDefault("password", "").trim();

        if (nickname.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "닉네임과 비밀번호를 입력해주세요."));
        }

        if (userRepository.existsByNickname(nickname)) {
            return ResponseEntity.badRequest().body(Map.of("error", "이미 사용 중인 닉네임입니다."));
        }

        User user = nicknames.register(nickname,passwordEncoder.encode(password),
                membershipService.visitorBase(request.getHeader("X-Visitor-Id")),request.getHeader("X-Visitor-Id"));
        return ResponseEntity.ok(UserResponse.from(user, authService.issueToken(user), membershipService.membership(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        final String nickname = body.getOrDefault("nickname", "").trim();
        final String password = body.getOrDefault("password", "").trim();

        if (nickname.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "닉네임과 비밀번호를 입력해주세요."));
        }

        Optional<User> userOpt = userRepository.findByNickname(nickname);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "존재하지 않는 닉네임입니다."));
        }

        User user = userOpt.get();
        if (isHashed(user.getPassword())) {
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "비밀번호가 틀렸습니다."));
            }
        } else {
            // 암호화 도입 전에 가입한 계정: 평문 비교 후 해시로 교체
            if (!user.getPassword().equals(password)) {
                return ResponseEntity.badRequest().body(Map.of("error", "비밀번호가 틀렸습니다."));
            }
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
        }

        return ResponseEntity.ok(UserResponse.from(user, authService.issueToken(user), membershipService.membership(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        User user = authService.requireUser(request);
        return ResponseEntity.ok(Map.of("id", user.getId(), "nickname", user.getNickname(),
                "membership", membershipService.membership(user)));
    }

    @PutMapping("/nickname")
    public ResponseEntity<?> nickname(@RequestBody Map<String,String> body,HttpServletRequest request) {
        User user=nicknames.rename(authService.requireUser(request),body.get("nickname"),request.getHeader("X-Visitor-Id"));
        return ResponseEntity.ok(Map.of("nickname",user.getNickname()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        authService.revoke(request);
        return ResponseEntity.ok(Map.of("ok", true));
    }

    private static boolean isHashed(String stored) {
        return stored != null && stored.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$");
    }
}
