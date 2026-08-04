package com.runner.core.code.service;

import com.runner.core.code.domain.CodeGroup;
import com.runner.core.code.mapper.CodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CodeService {

    private final CodeMapper codeMapper;

    public List<CodeGroup> getAllCodeGroups() {
        return codeMapper.findAllCodeGroups();
    }

    public CodeGroup getCodeGroup(String groupCode) {
        return codeMapper.findCodeGroupByGroupCode(groupCode)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코드 그룹입니다: " + groupCode));
    }
}
