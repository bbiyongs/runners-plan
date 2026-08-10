package com.runner.core.weather.domain;

import lombok.Getter;

@Getter
public enum WmoWeatherCode {
    SUNNY("SUNNY", 0, 1),
    CLOUDY("CLOUDY", 2, 3, 45, 48),
    RAIN("RAIN", 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99),
    SNOW("SNOW", 71, 73, 75, 77, 85, 86);

    private final String code;
    private final int[] wmoCodes;

    WmoWeatherCode(String code, int... wmoCodes) {
        this.code = code;
        this.wmoCodes = wmoCodes;
    }
    public static String toServiceWeatherCode(Integer wmoCode) {
        if (wmoCode == null) return SUNNY.getCode();
        for (WmoWeatherCode item : values()) {
            for (int codeVal : item.getWmoCodes()) {
                if (codeVal == wmoCode) {
                    return item.getCode();
                }
            }
        }
        return SUNNY.getCode();
    }
}
