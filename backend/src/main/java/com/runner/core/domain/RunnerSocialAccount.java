package com.runner.core.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunnerSocialAccount {
    private Long socialAccountId;   // 소셜 계정 ID (PK)
    private Long runnerId;          // 러너 ID (FK)
    private String provider;        // 소셜 제공자 (GOOGLE, NAVER, KAKAO 등)
    private String providerUserId;  // 제공자 측 고유 사용자 식별 ID
    private String providerEmail;   // 소셜 등록 이메일
    private String isPrimary;       // 대표 계정 여부 (Y/N)
    private LocalDateTime connectedAt;  // 연동 일시
    private LocalDateTime lastLoginAt;  // 최근 로그인 일시
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
