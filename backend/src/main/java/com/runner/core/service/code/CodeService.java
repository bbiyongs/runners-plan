package com.runner.core.service.code;

import com.runner.core.domain.CodeGroup;
import com.runner.core.mapper.CodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CodeService {
    private final CodeMapper codeMapper;

    public List<CodeGroup> getAllCodeGroups() {
        return codeMapper.selectAllCodeGroups();
    }

    public CodeGroup getCodeGroup(String groupCode) {
        return codeMapper.selectCodeGroupByCode(groupCode);
    }
}
