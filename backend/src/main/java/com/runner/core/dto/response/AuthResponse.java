package com.runner.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String grantType;     // "Bearer"
    private String accessToken;   // 30분짜리 단기 인증 토큰
    private String refreshToken;  // 14일짜리 재발급 토큰
    private Long runnerId;        // 러너 고유 ID
    private String nickname;      // 닉네임
}
