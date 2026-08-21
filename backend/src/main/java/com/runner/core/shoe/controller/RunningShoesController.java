package com.runner.core.shoe.controller;

import com.runner.core.global.config.CurrentRunnerId;
import com.runner.core.global.response.ApiResponse;
import com.runner.core.shoe.dto.request.ShoeCreateRequest;
import com.runner.core.shoe.dto.request.ShoeUpdateRequest;
import com.runner.core.shoe.dto.response.ShoePreviewResponse;
import com.runner.core.shoe.dto.response.ShoeResponse;
import com.runner.core.shoe.service.RunningShoesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shoes")
@RequiredArgsConstructor
public class RunningShoesController {

    private final RunningShoesService shoesService;

    // 1. 예상 누적거리 프리뷰 조회
    @GetMapping("/preview-distance")
    public ApiResponse<ShoePreviewResponse> getPreviewDistance(
            @CurrentRunnerId Long runnerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate purchasedDate,
            @RequestParam(defaultValue = "0.7") Float usageRatio
    ) {
        ShoePreviewResponse response = shoesService.calculatePreviewDistance(runnerId, purchasedDate, usageRatio);
        return ApiResponse.success("예상 누적 거리 계산 성공", response);
    }

    // 2. 러닝화 신규 등록
    @PostMapping
    public ApiResponse<ShoeResponse> registerShoe(
            @CurrentRunnerId Long runnerId,
            @Valid @RequestBody ShoeCreateRequest request
    ) {
        ShoeResponse response = shoesService.registerShoe(runnerId, request);
        return ApiResponse.success("러닝화가 성공적으로 등록되었습니다.", response);
    }

    // 3. 러닝화 목록 조회
    @GetMapping
    public ApiResponse<List<ShoeResponse>> getMyShoes(
            @CurrentRunnerId Long runnerId,
            @RequestParam(defaultValue = "false") boolean includeRetired
    ) {
        List<ShoeResponse> response = shoesService.getMyShoes(runnerId, includeRetired);
        return ApiResponse.success("러닝화 목록 조회 성공", response);
    }

    // 4. 러닝화 단건 상세 조회
    @GetMapping("/{id}")
    public ApiResponse<ShoeResponse> getShoeDetail(
            @CurrentRunnerId Long runnerId,
            @PathVariable("id") Long shoeId
    ) {
        ShoeResponse response = shoesService.getShoeDetail(runnerId, shoeId);
        return ApiResponse.success("러닝화 상세 조회 성공", response);
    }

    // 5. 러닝화 정보 수정
    @PutMapping("/{id}")
    public ApiResponse<ShoeResponse> updateShoe(
            @CurrentRunnerId Long runnerId,
            @PathVariable("id") Long shoeId,
            @Valid @RequestBody ShoeUpdateRequest request
    ) {
        ShoeResponse response = shoesService.updateShoe(runnerId, shoeId, request);
        return ApiResponse.success("러닝화 정보가 수정되었습니다.", response);
    }

    // 6. 대표 러닝화 설정
    @PatchMapping("/{id}/default")
    public ApiResponse<Void> setDefaultShoe(
            @CurrentRunnerId Long runnerId,
            @PathVariable("id") Long shoeId
    ) {
        shoesService.setDefaultShoe(runnerId, shoeId);
        return ApiResponse.success("대표 러닝화로 설정되었습니다.", null);
    }

    // 7. 러닝화 은퇴(사용 중단) 처리
    @PatchMapping("/{id}/retire")
    public ApiResponse<Void> retireShoe(
            @CurrentRunnerId Long runnerId,
            @PathVariable("id") Long shoeId
    ) {
        shoesService.retireShoe(runnerId, shoeId);
        return ApiResponse.success("러닝화가 은퇴 처리되었습니다.", null);
    }
}
