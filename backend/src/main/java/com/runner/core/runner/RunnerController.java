package com.runner.core.runner;

import com.runner.core.global.config.CurrentRunnerId;
import com.runner.core.global.response.ApiResponse;
import com.runner.core.runner.dto.response.DashboardResponse;
import com.runner.core.runner.service.RunnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/runners")
@RequiredArgsConstructor
public class RunnerController {
    private final RunnerService runnerService;

    //대시보드 요약 정보 조회
    @GetMapping("/me/dashboard")
    public ApiResponse<DashboardResponse> getMyDashboard(
            @CurrentRunnerId Long runnerId) {

        DashboardResponse dashboard = runnerService.getRunnerDashboard(runnerId);
        return ApiResponse.success("대시보드 정보 조회 성공", dashboard);
    }
}
