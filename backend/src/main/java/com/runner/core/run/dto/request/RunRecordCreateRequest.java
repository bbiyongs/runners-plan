package com.runner.core.run.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class RunRecordCreateRequest {

    @NotNull(message = "러닝 일시는 필수입니다.")
    private LocalDateTime runDatetime;
    @NotNull(message = "러닝 시간(초)은 필수입니다.")
    @Min(value = 1, message = "러닝시간은 1초 이상이어야합니다.")
    private Integer durationSec;
    @NotNull(message = "러닝 거리는 필수입니다.")
    @DecimalMin(value = "0.01", message = "러닝거리는 0.01km 이상이어야합니다.")
    private BigDecimal distanceKm;
    private Integer avgHr; //평균심박
    @NotBlank(message = "훈련 유형 코드는 필수입니다.")
    private String trainingTypeCode;

    private Integer rpe; // 운동 강도

    private BigDecimal temperature;
    private Integer humidity;
    private String weatherCode;
    private String memo;

 }
