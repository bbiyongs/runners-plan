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
public class ShoeUpdateRequest {

    @NotBlank(message = "러닝화 이름(모델명)은 필수입니다.")
    private String shoeName;

    private String brand;

    private LocalDate purchasedDate;

    @DecimalMin(value = "10.0", message = "목표 수명은 최소 10km 이상이어야 합니다.")
    private BigDecimal maxDistanceKm;

    private BigDecimal currentDistanceKm;

    private Boolean isDefault;

    private Boolean isRetired;
}
