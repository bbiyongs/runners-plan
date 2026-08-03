package com.runner.core.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeGroup {
    private String groupCode;
    private String groupName;
    private String description;
    private String useYn;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
