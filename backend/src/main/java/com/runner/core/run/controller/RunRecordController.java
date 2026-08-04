package com.runner.core.run.controller;

import com.runner.core.global.response.ApiResponse;
import com.runner.core.run.dto.request.RunRecordCreateRequest;
import com.runner.core.run.dto.response.RunRecordResponse;
import com.runner.core.run.service.RunRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/runs")
@RequiredArgsConstructor
public class RunRecordController {
    private final RunRecordService runRecordService;

    // 신규 기록 등록
    @PostMapping
    public ApiResponse<RunRecordResponse> createRunRecord(
            @RequestParam(defaultValue = "1") Long runnerId,
            @Valid @RequestBody RunRecordCreateRequest request
            ) {
        RunRecordResponse response = runRecordService.createRunRecord(runnerId, request);
        return ApiResponse.success("러닝기록이 성공적으로 등록되었습니다", response);
    }

    // 내 러닝 기록 조회
    @GetMapping
    public ApiResponse<List<RunRecordResponse>> getMyRunRecords(
            @RequestParam(defaultValue = "1") Long runnerId,
            @RequestParam(required = false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE)LocalDate endDate
            ){
        List<RunRecordResponse> response = runRecordService.getMyRunRecords(runnerId, startDate, endDate);
        return ApiResponse.success("러닝 기록 목록 조회성공", response);
    }

    // 러닝 기록 상세 조회
    @GetMapping("/{id}")
    public ApiResponse<RunRecordResponse> getRunRecordDetail(
            @RequestParam(defaultValue = "1")Long runnerId,
            @PathVariable("id") Long runRecordId ) {

        RunRecordResponse response = runRecordService.getRuuRecordDetail(runnerId, runRecordId);
        return ApiResponse.success("러닝 기록 상세정보 조회성공", response);
    }

    // 러닝기록 수정
    @PutMapping("/{id}")
    public ApiResponse<RunRecordResponse> updateRunRecord(
            @RequestParam(defaultValue = "1")Long runnerId,
            @PathVariable("id") Long runRecordId,
            @Valid @RequestBody RunRecordCreateRequest request) {

        RunRecordResponse response = runRecordService.updateRunRecord(runnerId, runRecordId, request);
        return ApiResponse.success("러닝 기록 수정 성공", response);
    }

    // 러닝 기록 삭제
    @DeleteMapping("/{id}")
    public ApiResponse<RunRecordResponse> deleteRunRecord(
            @RequestParam(defaultValue = "1")Long runnerId,
            @PathVariable("id")Long runRecordId){
        runRecordService.deleteRunRecord(runnerId, runRecordId);
        return ApiResponse.success("러닝 기록 삭제 성공", null);
    }
}
