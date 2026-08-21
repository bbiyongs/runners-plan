package com.runner.core.shoe.mapper;

import com.runner.core.shoe.domain.RunningShoes;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Mapper
public interface RunningShoesMapper {

    // 러닝화 등록
    void insertShoe(RunningShoes shoe);

    // 러닝화 단건 조회
    Optional<RunningShoes> findByIdAndRunnerId(@Param("shoeId") Long shoeId, @Param("runnerId") Long runnerId);

    // 러너의 러닝화 목록 조회 (은퇴 포함 여부)
    List<RunningShoes> findByRunnerId(@Param("runnerId") Long runnerId, @Param("includeRetired") boolean includeRetired);

    // 러닝화 정보 수정
    int updateShoe(RunningShoes shoe);

    // 기존 기본 러닝화 해제 (is_default = false)
    int clearDefaultShoes(@Param("runnerId") Long runnerId);

    // 특정 러닝화를 기본 대표로 설정 (is_default = true)
    int setDefaultShoe(@Param("shoeId") Long shoeId, @Param("runnerId") Long runnerId);

    // 러닝화 은퇴 처리 (is_retired = true, is_default = false)
    int retireShoe(@Param("shoeId") Long shoeId, @Param("runnerId") Long runnerId);

    // 러닝화 누적 거리 가산/차감
    int updateDistance(@Param("shoeId") Long shoeId, @Param("deltaDistanceKm") BigDecimal deltaDistanceKm);

    // 특정 날짜 이후 러너의 총 달린 거리 합산 (프리뷰 계산용)
    BigDecimal calculatePeriodDistance(@Param("runnerId") Long runnerId, @Param("purchasedDate") LocalDate purchasedDate);
}
