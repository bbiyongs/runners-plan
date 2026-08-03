package com.runner.core.controller.auth;

import com.runner.core.common.response.ApiResponse;
import com.runner.core.dto.request.SocialLoginRequest;
import com.runner.core.dto.response.AuthResponse;
import com.runner.core.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 소셜 로그인 & 자동 회원가입 API
    @PostMapping("/social-login")
    public ApiResponse<AuthResponse> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        AuthResponse response = authService.loginOrRegisterSocialAccount(request);
        return ApiResponse.success("소셜 로그인 성공", response);
    }
}