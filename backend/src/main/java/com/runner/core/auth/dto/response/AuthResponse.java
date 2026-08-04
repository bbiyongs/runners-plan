package com.runner.core.auth.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {
    private String grantType;
    private String accessToken;
    private String refreshToken;
    private Long runnerId;
    private String nickname;
}
