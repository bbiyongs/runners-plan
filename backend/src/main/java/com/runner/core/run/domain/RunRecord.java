package com.runner.core.run.domain;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunRecord {
    private Long runRecordId;
    private Long runnerId;
    private Long shoeId;            // 착용한 러닝화 ID
    private LocalDateTime runDatetime;
    private LocalDate runDate;
    private Integer durationSec;
    private BigDecimal distanceKm;
    private Integer avgPaceSec;
    private Integer avgHr;
    private Integer maxHr;          // 주행 중 최고/최대 심박수 (BPM)
    private Integer conditionScore; // 컨디션 (1: 무거움, 2: 보통, 3: 상쾌함)
    private String painAreaCode;    // 통증 부위 (NONE, KNEE_LEFT 등)
    private Integer painLevel;       // 통증 강도 (0: 없음 ~ 3: 심함)
    private BigDecimal temperature;
    private Integer humidity;
    private String weatherCode;
    private String memo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
