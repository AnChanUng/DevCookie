package com.csstudy.backend.service;

// 사용자가 쓴 글을 Mattermost에 올릴 때 @멘션, #채널 링크가 실제로 걸리지 않게 보이지 않는 문자를 끼운다
final class MattermostLinks {
    private MattermostLinks() {}

    static String plain(String s) {
        return s == null ? "" : s.replace("@", "@​").replace("#", "#​");
    }
}
