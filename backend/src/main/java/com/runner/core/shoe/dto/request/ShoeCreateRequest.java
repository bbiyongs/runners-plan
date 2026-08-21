package com.runner.core.shoe.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class ShoeCreateRequest {

    @NotBlank(message = "러닝화 이름(모델명)은 필수입니다.")
    private String shoeName;

    private String brand;

    private LocalDate purchasedDate;

    @DecimalMin(value = "10.0", message = "목표 수명은 최소 10km 이상이어야 합니다.")
    private BigDecimal maxDistanceKm = BigDecimal.valueOf(600.0); // 기본값 600km

    private BigDecimal initialDistanceKm = BigDecimal.ZERO;      // 초기 누적 주행거리

    private Boolean isDefault = false;                          // 기본 대표 러닝화 여부
}
