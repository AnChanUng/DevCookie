package com.csstudy.backend.entity;

public enum UserTier {
    BRONZE("브론즈"), SILVER("실버"), GOLD("골드"), DIAMOND("다이아"), RUBY("루비");

    private final String label;
    UserTier(String label) { this.label = label; }
    public String label() { return label; }

    // Thresholds run from V to I. Each promotion within a tier needs more new questions.
    public long[] thresholds() {
        return switch (this) {
            case BRONZE -> new long[]{0, 5, 12, 25, 45};
            case SILVER -> new long[]{50, 60, 80, 120, 180};
            case GOLD -> new long[]{0, 20, 50, 100, 170};
            case DIAMOND -> new long[]{200, 250, 350, 550, 850};
            case RUBY -> new long[]{1000, 1100, 1300, 1700, 2300};
        };
    }

    public int division(long solved) {
        long[] thresholds = thresholds();
        for (int i = 4; i >= 0; i--) if (solved >= thresholds[i]) return 5 - i;
        return 5;
    }

    public String displayName(int division) {
        return label + " " + new String[]{"", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"}[division];
    }

    public static UserTier calculate(UserTier base, long solved) {
        UserTier earned = solved >= 1000 ? RUBY : solved >= 200 ? DIAMOND : solved >= 50 ? SILVER : BRONZE;
        return base.ordinal() > earned.ordinal() ? base : earned;
    }
}
