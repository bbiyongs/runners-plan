package com.runner.core.weather.domain;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum RunningLocation {
    SEOUL_METRO("서울/수도권 북부", 37.5665, 126.9780),
    GYEONGGI_SOUTH("수도권 남부 (성남/수원/용인)", 37.3827, 127.1189),
    INCHEON_WEST("인천/수도권 서부", 37.4563, 126.7052),
    GANGWON("강원권 (춘천/원주/강릉)", 37.7519, 128.8761),
    CHUNGCHEONG("대전/충청권", 36.3504, 127.3845),
    GYEONGBUK("대구/경북권", 35.8714, 128.6014),
    GYEONGNAM("부산/울산/경남권", 35.1796, 129.0756),
    JEONLA("광주/전라권", 35.1595, 126.8526),
    JEJU("제주도", 33.4996, 126.5312),
    OTHER("해외/기타", 37.5665, 126.9780);

    private final String label;
    private final Double lat;
    private final Double lon;

    RunningLocation(String label, Double lat, Double lon) {
        this.label = label;
        this.lat = lat;
        this.lon = lon;
    }

    public static RunningLocation findByLabel(String label) {
        return Arrays.stream(values())
                .filter(loc-> loc.getLabel().equals(label))
                .findFirst()
                .orElse(SEOUL_METRO);
    }
}
