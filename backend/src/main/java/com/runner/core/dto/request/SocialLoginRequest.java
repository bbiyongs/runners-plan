package com.runner.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SocialLoginRequest {
    @NotBlank(message = "소셜 제공자는 필수입니다 (GOOGLE, NAVER 등)")
    private String provider;
    @NotBlank(message = "소셜 사용자 ID는 필수입니다")
    private String providerUserId;
    private String providerEmail;
    private String nickname;
    private String profileImageUrl;
}
