package com.runner.core.shoe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShoePreviewResponse {

    private BigDecimal totalPeriodDistanceKm; // 착용 시작일 이후 총 주행 거리
    private Float usageRatio;                  // 적용한 착용 비중 (0.3, 0.5, 0.7, 1.0)
    private BigDecimal estimatedDistanceKm;    // 최종 예상 누적 거리 (round(total * ratio, 1))
}
