package com.runner.core.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class SocialLoginRequest {

    @NotBlank(message = "소셜 제공자는 필수입니다.")
    private String provider;          // GOOGLE, NAVER 등

    @NotBlank(message = "소셜 고유 ID는 필수입니다.")
    private String providerUserId;    // 소셜 사용자 고유 ID

    private String providerEmail;     // 소셜 이메일 (선택)
    private String nickname;          // 소셜 닉네임 (선택)
    private String profileImageUrl;   // 프로필 이미지 URL (선택)
}
