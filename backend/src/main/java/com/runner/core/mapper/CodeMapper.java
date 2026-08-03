package com.runner.core.mapper;

import com.runner.core.domain.CodeGroup;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CodeMapper {
    List<CodeGroup> selectAllCodeGroups();

    CodeGroup selectCodeGroupByCode(String groupCode);
}
