package com.runner.core.runner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class DashboardResponse {
    // 러너 기본 정보 및 케릭터레벨
    private Long runnerId;
    private String nickname;
    private String profileImageUrl;
    private String levelCode;
    private String levelName;

    // 전체 누적 통계
    private BigDecimal totalDistanceKm; // 누적거리 km
    private Integer totalRunCount;  // 러닝횟수
    private Integer totalDurationSec;   // 러닝시간
    private Integer avgPaceSec; // 전체 평균페이스
    private String formattedAvgPace;    // 전체 평균페이스 문자열

    // 이번달 통계요약
    private BigDecimal monthlyDistanceKm; // 이번달 누적거리
    private Integer monthlyRunCount; // 이번달 러닝 횟수
    private Integer monthlyDurationSec; // 이번달 러닝 시간

    // 초 단위 페이스 포멧팅
    public static String formatPace(Integer avgPaceSec) {
        if(avgPaceSec == null || avgPaceSec <= 0) return null;
        int min = avgPaceSec / 60;
        int sec = avgPaceSec % 60;
        return String.format("%02d'%02d\"", min, sec);
    }
}
