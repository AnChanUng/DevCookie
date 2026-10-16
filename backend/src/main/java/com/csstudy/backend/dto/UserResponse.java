package com.csstudy.backend.dto;

import com.csstudy.backend.entity.User;
import com.csstudy.backend.service.MembershipService;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String nickname;
    private String token;
    private MembershipService.Membership membership;

    public static UserResponse from(User user, String token, MembershipService.Membership membership) {
        return new UserResponse(user.getId(), user.getNickname(), token, membership);
    }
}
