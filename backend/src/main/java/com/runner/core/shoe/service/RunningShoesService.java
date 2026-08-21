package com.runner.core.shoe.service;

import com.runner.core.shoe.domain.RunningShoes;
import com.runner.core.shoe.dto.request.ShoeCreateRequest;
import com.runner.core.shoe.dto.request.ShoeUpdateRequest;
import com.runner.core.shoe.dto.response.ShoePreviewResponse;
import com.runner.core.shoe.dto.response.ShoeResponse;
import com.runner.core.shoe.mapper.RunningShoesMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RunningShoesService {

    private final RunningShoesMapper shoeMapper;

    /**
     * 1. 예상 누적거리 프리뷰 계산
     */
    @Transactional(readOnly = true)
    public ShoePreviewResponse calculatePreviewDistance(Long runnerId, LocalDate purchasedDate, Float usageRatio) {
        if (purchasedDate == null) {
            purchasedDate = LocalDate.now();
        }
        if (usageRatio == null || usageRatio <= 0.0f) {
            usageRatio = 0.7f; // 기본 추천 비중 70%
        }

        BigDecimal totalPeriodDistance = shoeMapper.calculatePeriodDistance(runnerId, purchasedDate);
        if (totalPeriodDistance == null) {
            totalPeriodDistance = BigDecimal.ZERO;
        }

        // estimatedDistance = round(totalPeriodDistance * usageRatio, 1)
        BigDecimal estimatedDistance = totalPeriodDistance
                .multiply(BigDecimal.valueOf(usageRatio))
                .setScale(1, RoundingMode.HALF_UP);

        return ShoePreviewResponse.builder()
                .totalPeriodDistanceKm(totalPeriodDistance.setScale(1, RoundingMode.HALF_UP))
                .usageRatio(usageRatio)
                .estimatedDistanceKm(estimatedDistance)
                .build();
    }

    /**
     * 2. 러닝화 신규 등록
     */
    @Transactional
    public ShoeResponse registerShoe(Long runnerId, ShoeCreateRequest request) {
        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault());

        // 대표 신발로 설정하는 경우 기존 기본 신발 해제
        if (isDefault) {
            shoeMapper.clearDefaultShoes(runnerId);
        }

        BigDecimal initialDistance = request.getInitialDistanceKm() != null
                ? request.getInitialDistanceKm()
                : BigDecimal.ZERO;

        BigDecimal maxDistance = request.getMaxDistanceKm() != null
                ? request.getMaxDistanceKm()
                : BigDecimal.valueOf(600.0);

        RunningShoes shoe = RunningShoes.builder()
                .runnerId(runnerId)
                .shoeName(request.getShoeName())
                .brand(request.getBrand())
                .purchasedDate(request.getPurchasedDate())
                .maxDistanceKm(maxDistance)
                .currentDistanceKm(initialDistance)
                .isDefault(isDefault)
                .isRetired(false)
                .build();

        shoeMapper.insertShoe(shoe);
        log.info("러닝화 등록 완료: shoeId {}, runnerId {}", shoe.getShoeId(), runnerId);

        return ShoeResponse.from(shoe);
    }

    /**
     * 3. 러닝화 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ShoeResponse> getMyShoes(Long runnerId, boolean includeRetired) {
        List<RunningShoes> shoes = shoeMapper.findByRunnerId(runnerId, includeRetired);
        return shoes.stream()
                .map(ShoeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 4. 러닝화 단건 조회
     */
    @Transactional(readOnly = true)
    public ShoeResponse getShoeDetail(Long runnerId, Long shoeId) {
        RunningShoes shoe = shoeMapper.findByIdAndRunnerId(shoeId, runnerId)
                .orElseThrow(() -> new IllegalArgumentException("해당 러닝화를 찾을 수 없습니다. ID: " + shoeId));
        return ShoeResponse.from(shoe);
    }

    /**
     * 5. 러닝화 정보 수정
     */
    @Transactional
    public ShoeResponse updateShoe(Long runnerId, Long shoeId, ShoeUpdateRequest request) {
        RunningShoes existing = shoeMapper.findByIdAndRunnerId(shoeId, runnerId)
                .orElseThrow(() -> new IllegalArgumentException("수정할 러닝화를 찾을 수 없습니다. ID: " + shoeId));

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(existing.getIsDefault())) {
            shoeMapper.clearDefaultShoes(runnerId);
        }

        existing.setShoeName(request.getShoeName());
        existing.setBrand(request.getBrand());
        if (request.getPurchasedDate() != null) {
            existing.setPurchasedDate(request.getPurchasedDate());
        }
        if (request.getMaxDistanceKm() != null) {
            existing.setMaxDistanceKm(request.getMaxDistanceKm());
        }
        if (request.getCurrentDistanceKm() != null) {
            existing.setCurrentDistanceKm(request.getCurrentDistanceKm());
        }
        if (request.getIsDefault() != null) {
            existing.setIsDefault(request.getIsDefault());
        }
        if (request.getIsRetired() != null) {
            existing.setIsRetired(request.getIsRetired());
        }

        shoeMapper.updateShoe(existing);
        log.info("러닝화 정보 수정 완료: shoeId {}, runnerId {}", shoeId, runnerId);

        return ShoeResponse.from(existing);
    }

    /**
     * 6. 대표 러닝화 설정
     */
    @Transactional
    public void setDefaultShoe(Long runnerId, Long shoeId) {
        shoeMapper.findByIdAndRunnerId(shoeId, runnerId)
                .orElseThrow(() -> new IllegalArgumentException("러닝화를 찾을 수 없습니다. ID: " + shoeId));

        shoeMapper.clearDefaultShoes(runnerId);
        shoeMapper.setDefaultShoe(shoeId, runnerId);
        log.info("대표 러닝화 설정 완료: shoeId {}, runnerId {}", shoeId, runnerId);
    }

    /**
     * 7. 러닝화 은퇴(사용 중단) 처리
     */
    @Transactional
    public void retireShoe(Long runnerId, Long shoeId) {
        shoeMapper.findByIdAndRunnerId(shoeId, runnerId)
                .orElseThrow(() -> new IllegalArgumentException("러닝화를 찾을 수 없습니다. ID: " + shoeId));

        shoeMapper.retireShoe(shoeId, runnerId);
        log.info("러닝화 은퇴 처리 완료: shoeId {}, runnerId {}", shoeId, runnerId);
    }

    /**
     * 8. 러닝 기록 연동용 거리 가감 메서드
     */
    @Transactional
    public void updateShoeDistance(Long shoeId, BigDecimal deltaDistanceKm) {
        if (shoeId == null || deltaDistanceKm == null || deltaDistanceKm.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }
        shoeMapper.updateDistance(shoeId, deltaDistanceKm);
    }
}
