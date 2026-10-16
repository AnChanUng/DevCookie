package com.csstudy.backend.entity;

public enum UserTier {
    BRONZE("브론즈"), SILVER("실버"), GOLD("골드"), DIAMOND("다이아"), RUBY("루비");

    private final String label;
    UserTier(String label) { this.label = label; }
    public String label() { return label; }

    public static UserTier calculate(UserTier base, long solved) {
        UserTier earned = solved >= 1000 ? RUBY : solved >= 200 ? DIAMOND : solved >= 50 ? SILVER : BRONZE;
        return base.ordinal() > earned.ordinal() ? base : earned;
    }
}
