package com.runner.core.run.dto.request;

import jakarta.validation.constraints.*;
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
    private Long shoeId; // 착용한 러닝화 ID (선택)

    @Min(value = 30, message = "평균 심박수는 30 이상이어야 합니다.")
    @Max(value = 250, message = "평균 심박수는 250 이하이어야 합니다.")
    private Integer avgHr; // 평균심박
    @Min(value = 30, message = "최대 심박수는 30 이상이어야 합니다.")
    @Max(value = 250, message = "최대 심박수는 250 이하이어야 합니다.")
    private Integer maxHr; // 추가: 최대심박

    @Min(value = 1, message = "컨디션 점수는 1 이상이어야 합니다.")
    @Max(value = 3, message = "컨디션 점수는 3 이하이어야 합니다.")
    private Integer conditionScore;

    private String painAreaCode;

    @Min(value = 0, message = "통증 레벨은 0 이상이어야 합니다.")
    @Max(value = 3, message = "통증 레벨은 3 이하이어야 합니다.")
    private Integer painLevel;
    private BigDecimal temperature;
    private Integer humidity;
    private String weatherCode;
    private String memo;

 }
