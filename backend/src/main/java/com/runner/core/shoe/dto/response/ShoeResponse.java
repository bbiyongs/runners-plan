package com.runner.core.shoe.dto.response;

import com.runner.core.shoe.domain.RunningShoes;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShoeResponse {

    private Long shoeId;
    private Long runnerId;
    private String shoeName;
    private String brand;
    private LocalDate purchasedDate;
    private BigDecimal currentDistanceKm;
    private BigDecimal maxDistanceKm;
    private BigDecimal remainingDistanceKm; // 잔여 거리
    private BigDecimal usageRatePct;         // 수명 사용률 (%)
    private String status;                   // SAFE, WARNING, DANGER
    private Boolean isDefault;
    private Boolean isRetired;
    private LocalDateTime createdAt;

    public static ShoeResponse from(RunningShoes shoe) {
        BigDecimal current = shoe.getCurrentDistanceKm() != null ? shoe.getCurrentDistanceKm() : BigDecimal.ZERO;
        BigDecimal max = shoe.getMaxDistanceKm() != null && shoe.getMaxDistanceKm().compareTo(BigDecimal.ZERO) > 0
                ? shoe.getMaxDistanceKm()
                : BigDecimal.valueOf(600.0);

        // 잔여 거리 = max - current (0 미만이면 0)
        BigDecimal remaining = max.subtract(current);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        // 수명 사용률 (%) = (current / max) * 100
        BigDecimal usageRate = current.divide(max, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);

        // 상태 판정 (90% 이상: DANGER, 80% 이상: WARNING, 그 외: SAFE)
        String status = "SAFE";
        if (usageRate.compareTo(BigDecimal.valueOf(90.0)) >= 0) {
            status = "DANGER";
        } else if (usageRate.compareTo(BigDecimal.valueOf(80.0)) >= 0) {
            status = "WARNING";
        }

        return ShoeResponse.builder()
                .shoeId(shoe.getShoeId())
                .runnerId(shoe.getRunnerId())
                .shoeName(shoe.getShoeName())
                .brand(shoe.getBrand())
                .purchasedDate(shoe.getPurchasedDate())
                .currentDistanceKm(current.setScale(1, RoundingMode.HALF_UP))
                .maxDistanceKm(max.setScale(1, RoundingMode.HALF_UP))
                .remainingDistanceKm(remaining.setScale(1, RoundingMode.HALF_UP))
                .usageRatePct(usageRate)
                .status(status)
                .isDefault(shoe.getIsDefault())
                .isRetired(shoe.getIsRetired())
                .createdAt(shoe.getCreatedAt())
                .build();
    }
}
