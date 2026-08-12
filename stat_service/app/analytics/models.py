from typing import List, Optional
from pydantic import BaseModel, Field

class GrowthInsight(BaseModel):
    """전월(MoM) 및 전년 동월(YoY) 성과 비교 인사이트 DTO"""
    mom_distance_change_pct: Optional[float] = Field(None, description="전월 대비 거리 변화율 (%)")
    mom_pace_change_sec: Optional[int] = Field(None, description="전월 대비 페이스 단축/지연 초")
    yoy_distance_change_pct: Optional[float] = Field(None, description="전년 동월 대비 거리 변화율 (%)")
    yoy_pace_change_sec: Optional[int] = Field(None, description="전년 동월 대비 페이스 단축/지연 초")
    
    # 원본 데이터 비교 수치 필드 추가
    current_mtd_distance_km: Optional[float] = Field(None, description="이번 달 MTD 누적 거리 (km)")
    prev_month_mtd_distance_km: Optional[float] = Field(None, description="지난달 MTD 누적 거리 (km)")
    prev_year_mtd_distance_km: Optional[float] = Field(None, description="작년 동월 MTD 누적 거리 (km)")
    max_day: Optional[int] = Field(None, description="MTD 기준 일자 (예: 12일)")
    
    insight_text: str = Field(..., description="사용자 친화적 인사이트 문구")

class RollingTrendPoint(BaseModel):
    """일별 훈련량 및 이동평균(7일/30일) 시계열 데이터 포인트 DTO"""
    run_date: str = Field(..., description="날짜 (YYYY-MM-DD)")
    distance_km: float = Field(..., description="당일 달린 거리 (km)")
    avg_pace_sec: Optional[int] = Field(None, description="당일 평균 페이스 (초)")
    rolling_7d_distance: float = Field(..., description="7일 이동평균 거리 (km)")
    rolling_30d_distance: float = Field(..., description="30일 이동평균 거리 (km)")

class AcwrStatus(BaseModel):
    """ACWR (Acute:Chronic Workload Ratio) 부상 위험 방지 지표 DTO"""
    acute_workload: float = Field(..., description="최근 7일 누적 훈련량 (km)")
    chronic_workload: float = Field(..., description="최근 28일 평균 주간 훈련량 (km)")
    acwr_ratio: float = Field(..., description="ACWR 비율 (Acute / Chronic)")
    risk_level: str = Field(..., description="부상 위험 등급: SAFE, WARNING, DANGER, UNDER")
    insight_text: str = Field(..., description="부상 위험 관련 추천 조언 문구")

class HeatmapPoint(BaseModel):
    """요일별 / 시간대별 러닝 성과 포인트 DTO"""
    weekday: str = Field(..., description="요일 (월, 화, 수, 목, 금, 토, 일)")
    time_slot: str = Field(..., description="시간대 (아침, 낮, 저녁, 심야)")
    run_count: int = Field(..., description="해당 시간대 러닝 횟수")
    avg_pace_sec: Optional[int] = Field(None, description="해당 시간대 평균 페이스 (초)")

class HeatmapInsight(BaseModel):
    """러닝 파워 핫스팟 인사이트 DTO"""
    best_slot_text: str = Field(..., description="최적 러닝 시간대 인사이트 문구")
    points: List[HeatmapPoint] = Field(default_factory=list, description="시간대별 분포 포인트")

class GarminLapDetail(BaseModel):
    """가민 1km 랩타임 데이터 DTO"""
    lap_index: int = Field(..., description="랩 번호 (1km 기준)")
    distance_km: float = Field(..., description="구간 거리")
    duration_sec: int = Field(..., description="구간 소요 시간 (초)")
    avg_pace_sec: Optional[int] = Field(None, description="구간 평균 페이스 (초)")
    avg_hr: Optional[int] = Field(None, description="구간 평균 심박수")

class GarminHrZoneItem(BaseModel):
    """심박수 구간 분포 DTO"""
    zone_name: str = Field(..., description="Zone 1 ~ Zone 5")
    percentage: float = Field(..., description="해당 구간 비중 (%)")
    duration_sec: int = Field(..., description="해당 구간 머문 시간 (초)")

class GarminPacingInsight(BaseModel):
    """가민 정밀 분석 - 페이싱 스타일 & 심박 구간 DTO (Premium)"""
    is_garmin_connected: bool = Field(True, description="가민 연동 여부")
    pacing_style: str = Field(..., description="NEGATIVE_SPLIT, POSITIVE_SPLIT, EVEN_SPLIT")
    pacing_description: str = Field(..., description="페이싱 스타일 설명")
    laps: List[GarminLapDetail] = Field(default_factory=list, description="랩타임 리스트")
    hr_zones: List[GarminHrZoneItem] = Field(default_factory=list, description="심박 구간 분포")

class AnalyticsSummaryResponse(BaseModel):
    """통계 분석 메인 응답 DTO"""
    runner_id: int
    total_distance_km: float = Field(..., description="총 누적 거리")
    total_runs: int = Field(..., description="총 러닝 횟수")
    growth: Optional[GrowthInsight] = None
    rolling_trends: List[RollingTrendPoint] = Field(default_factory=list)
    acwr: Optional[AcwrStatus] = None
    heatmap: Optional[HeatmapInsight] = None
    garmin_analytics: Optional[GarminPacingInsight] = None