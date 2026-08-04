package com.runner.core.runner.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class RunnerStatVo {
    private BigDecimal totalDistanceKm; // 총 누적거리
    private Integer totalRunCount;  // 총 러닝횟수
    private Integer totalDurationSec;   // 총 러닝시간
    private Integer avgPaceSec;     // 평균 페이스

    private BigDecimal monthlyDistanceKm;   // 이번달 누적 거리
    private Integer monthlyRunCount;    // 이번달 러닝 횟수
    private Integer monthlyDurationSec; // 이번달 러닝 시간
}
