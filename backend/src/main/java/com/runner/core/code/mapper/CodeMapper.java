package com.runner.core.code.mapper;

import com.runner.core.code.domain.CodeDetail;
import com.runner.core.code.domain.CodeGroup;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CodeMapper {

    List<CodeGroup> findAllCodeGroups();

    Optional<CodeGroup> findCodeGroupByGroupCode(@Param("groupCode") String groupCode);

    List<CodeDetail> findCodeDetailsByGroupCode(@Param("groupCode") String groupCode);
}
