package com.runner.core.code.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeDetail {
    private Long codeId;
    private String groupCode;
    private String codeValue;
    private String codeName;
    private String description;
    private Integer sortOrder;
    private String useYn;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
