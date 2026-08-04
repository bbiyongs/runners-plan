package com.runner.core.run.mapper;

import com.runner.core.run.domain.RunRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface RunRecordMapper {
    // 기록 등록
    int insertRunRecord(RunRecord runRecord);

    // 특정 러너 기록 단건 조회
    Optional<RunRecord> findByIdAndRunnerId(@Param("runRecordId")Long runRecordId, @Param("runnerId")Long runnerId);

    // 특정러너 러닝기록 목록 조회
    List<RunRecord> findByRunnerId(
            @Param("runnerId") Long runnderId,
            @Param("startDate")LocalDate startDate,
            @Param("endDate")LocalDate endDate
            );

    // 러닝 기록 수정
    int updateRunRecord(RunRecord runRecord);

    // 러닝 기록 삭제
    int deleteByIdAndRunnerId(@Param("runRecordId")Long runRecordId, @Param("runnerId")Long runnerId);
}
