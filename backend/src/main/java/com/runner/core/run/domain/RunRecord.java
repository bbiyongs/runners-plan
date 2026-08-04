package com.runner.core.run.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunRecord {
    private Long runRecordId;
    private Long runnerId;
    private LocalDateTime runDatetime;
    private LocalDate runDate;
    private Integer durationSec;
    private BigDecimal distanceKm;
    private Integer avgPaceSec;
    private Integer avgHr;
    private String trainingTypeCode;
    private Integer rpe;
    private BigDecimal temperature;
    private Integer humidity;
    private String weatherCode;
    private String memo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
