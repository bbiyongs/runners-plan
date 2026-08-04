package com.runner.core.code.controller;

import com.runner.core.code.domain.CodeGroup;
import com.runner.core.code.service.CodeService;
import com.runner.core.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/codes")
@RequiredArgsConstructor
public class CodeController {
    private final CodeService codeService;

    @GetMapping("/groups")
    public ApiResponse<List<CodeGroup>> getCodeGroups() {
        List<CodeGroup> groups = codeService.getAllCodeGroups();
        return ApiResponse.success("공통코드 조회 성공", groups);
    }

    @GetMapping("/groups/{groupCode}")
    public ApiResponse<CodeGroup> getCodeGroup(@PathVariable String groupCode) {
        CodeGroup group = codeService.getCodeGroup(groupCode);
        return ApiResponse.success(group);
    }
}
