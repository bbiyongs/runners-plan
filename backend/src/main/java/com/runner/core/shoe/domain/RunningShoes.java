package com.runner.core.shoe.domain;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunningShoes {
    private Long shoeId;
    private Long runnerId;
    private String shoeName;
    private String brand;
    private BigDecimal maxDistanceKm;      // 목표 수명 (기본 600km)
    private BigDecimal currentDistanceKm;  // 누적 주행 거리
    private Boolean isDefault;              // 기본 대표 러닝화 여부
    private Boolean isRetired;              // 사용 중단(은퇴) 여부
    private LocalDate purchasedDate;        // 착용 시작일 / 구매일
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
