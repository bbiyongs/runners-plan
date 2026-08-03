package com.runner.core.controller.code;

import com.runner.core.common.response.ApiResponse;
import com.runner.core.domain.CodeGroup;
import com.runner.core.service.code.CodeService;
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
    public ApiResponse<List<CodeGroup>> getGodeGroups(){
        List<CodeGroup> groups = codeService.getAllCodeGroups();
        return ApiResponse.success("공통코드 조회 성공 ", groups);
    }

    @GetMapping("/groups/{groupCode}")
    public ApiResponse<CodeGroup> getCodeGroup(@PathVariable String groupCode) {
        CodeGroup group = codeService.getCodeGroup(groupCode);
        return ApiResponse.success(group);
    }

}
