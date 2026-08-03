package com.runner.core.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Runner {
    private Long runnerId;           // 러너 고유 ID (PK)
    private String nickname;         // 닉네임
    private String profileImageUrl;  // 프로필 이미지 URL
    private LocalDateTime createdAt; // 가입 일시
    private LocalDateTime updatedAt; // 수정 일시
}
