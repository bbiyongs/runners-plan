package com.runner.core.runner.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunnerSocialAccount {
    private Long socialAccountId;
    private Long runnerId;
    private String provider;
    private String providerUserId;
    private String providerEmail;
    private String isPrimary;
    private LocalDateTime connectedAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
