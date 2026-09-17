package com.csstudy.backend.dto;

import com.csstudy.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String nickname;
    private String token;

    public static UserResponse from(User user, String token) {
        return new UserResponse(user.getId(), user.getNickname(), token);
    }
}
