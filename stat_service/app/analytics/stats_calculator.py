import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.db_models.run_models import RunRecord

from app.analytics.models import (
    GrowthInsight,
    RollingTrendPoint,
    AcwrStatus,
    HeatmapPoint,
    HeatmapInsight,
    GarminLapDetail,
    GarminHrZoneItem,
    GarminPacingInsight,
    AnalyticsSummaryResponse
)


# 1. 시간대 분류 헬퍼 함수 정의
def get_time_slot(hour):
    if pd.isna(hour):
        return '미정'
    hour = int(hour)
    if 5 <= hour < 11:
        return '아침'
    elif 11 <= hour < 17:
        return '낮'
    elif 17 <= hour < 22:
        return '저녁'
    else:
        return '심야'
        
class AnalyticsCalculator : 
    """ pandas 기반 러닝 시계열 데이터 분석 계산 """
    def __init__(self, db:Session, runner_id: int):
        self.db = db
        self.runner_id = runner_id

    def build_analytics(self) -> AnalyticsSummaryResponse:
        """ 전체 통계 인사이트 응답 생성 메인 메소드 """
        runs = self.db.query(RunRecord).filter(RunRecord.runner_id == self.runner_id).order_by(RunRecord.run_date.asc()).all()

        if not runs:
            return AnalyticsSummaryResponse(
                runner_id=self.runner_id,
                total_distance_km=0.0,
                total_runs=0,
                growth=None,
                rolling_trends=[],
                acwr=None,
                heatmap=None,
                garmin_analytics=None
            )

        data = [{
            "run_record_id": r.run_record_id,
            "run_datetime" : r.run_datetime,
            "run_date": r.run_date,
            "duration_sec":r.duration_sec,
            "distance_km": float(r.distance_km) if r.distance_km else 0.0,
            "avg_pace_sec":r.avg_pace_sec,
            "avg_hr":r.avg_hr
        } for r in runs ]

        df = pd.DataFrame(data)
        df['run_datetime'] = pd.to_datetime(df['run_datetime'])
        df['run_date_dt'] = pd.to_datetime(df['run_date']).dt.normalize()

        return AnalyticsSummaryResponse(
            runner_id=self.runner_id,
            total_distance_km=round(float(df['distance_km'].sum()), 2),
            total_runs=len(df),
            growth=self._calculate_growth(df),
            rolling_trends=self._calculate_rolling_trends(df),
            acwr=self._calculate_acwr(df),
            heatmap=self._calculate_heatmap(df),
            garmin_analytics=None
        )

    def _calculate_growth(self, df:pd.DataFrame) -> Optional[GrowthInsight]:
        """ 전월 / 전년 동월 성장 추이 분석 """
        if df.empty:
            return None

        # 월 단위 집계 
        df['year_month'] = df['run_datetime'].dt.to_period('M')
        df_monthly = df.groupby('year_month').agg({
            'distance_km':'sum',
            'avg_pace_sec': 'mean'
        }).reset_index()

        if df_monthly.empty :
            return None

        # 가장 최근에 달린 월 
        latest_period = df_monthly['year_month'].max()
        current_month_data = df_monthly[df_monthly['year_month']== latest_period].iloc[0]

        # 전월 : 이전달 
        prev_period = latest_period -1
        prev_month_df = df_monthly[df_monthly['year_month']== prev_period]

        mom_dist_pct = None
        mom_pace_diff = None

        if not prev_month_df.empty:
            prev_month_data = prev_month_df.iloc[0]
            if prev_month_data['distance_km'] > 0:
                mom_dist_pct = round(((current_month_data['distance_km'] - prev_month_data['distance_km']) / prev_month_data['distance_km']) * 100, 1)
            if pd.notna(current_month_data['avg_pace_sec']) and pd.notna(prev_month_data['avg_pace_sec']):
                mom_pace_diff = int(current_month_data['avg_pace_sec'] - prev_month_data['avg_pace_sec'])

        # 전년 동월 
        prev_year_period = latest_period - 12
        prev_year_df = df_monthly[df_monthly['year_month'] == prev_year_period]

        yoy_dist_pct = None
        yoy_pace_diff = None

        if not prev_year_df.empty:
            prev_year_data = prev_year_df.iloc[0]
            if prev_year_data['distance_km'] > 0:
                yoy_dist_pct = round(((current_month_data['distance_km'] - prev_year_data['distance_km']) / prev_year_data['distance_km']) * 100, 1)
            if pd.notna(current_month_data['avg_pace_sec']) and pd.notna(prev_year_data['avg_pace_sec']):
                yoy_pace_diff = int(current_month_data['avg_pace_sec'] - prev_year_data['avg_pace_sec'])

        # 4. 인사이트 문구 생성
        insight_parts = []
        if mom_dist_pct is not None:
            sign = "+" if mom_dist_pct >= 0 else ""
            insight_parts.append(f"지난달 대비 거리는 {sign}{mom_dist_pct}% 변화했습니다.")
        if mom_pace_diff is not None:
            if mom_pace_diff < 0:
                insight_parts.append(f"페이스는 {abs(mom_pace_diff)}초 단축되었습니다! 🏆")
            elif mom_pace_diff > 0:
                insight_parts.append(f"페이스는 {mom_pace_diff}초 증가했습니다.")
        text = " ".join(insight_parts) if insight_parts else "데이터를 축적하면 성과 인사이트가 제공됩니다."
        return GrowthInsight(
            mom_distance_change_pct=mom_dist_pct,
            mom_pace_change_sec=mom_pace_diff,
            yoy_distance_change_pct=yoy_dist_pct,
            yoy_pace_change_sec=yoy_pace_diff,
            insight_text=text
        )

    def _calculate_rolling_trends(self, df: pd.DataFrame) -> List[RollingTrendPoint] :
        """ 7일 / 30일 평균 훈련 트렌드 """
        if df.empty : 
            return []

        all_dates = pd.date_range(start=df['run_date_dt'].min(), end=df['run_date_dt'].max(), freq='D')
        daily_df = df.groupby('run_date_dt').agg({
            'distance_km': 'sum',
            'avg_pace_sec': 'mean'
        }).reindex(all_dates, fill_value=0.0).reset_index()

        daily_df.rename(columns={'index':'run_date'}, inplace=True)
        daily_df['rolling_7d'] = daily_df['distance_km'].rolling(window=7, min_periods=1).mean()
        daily_df['rolling_30d'] = daily_df['distance_km'].rolling(window=30, min_periods=1).mean()

        return [RollingTrendPoint(
            run_date=row['run_date'].strftime('%Y-%m-%d'),
            distance_km=round(float(row['distance_km']), 2),
            avg_pace_sec=int(row['avg_pace_sec']) if pd.notna(row['avg_pace_sec']) and row['avg_pace_sec'] > 0 else None,
            rolling_7d_distance=round(float(row['rolling_7d']), 2),
            rolling_30d_distance=round(float(row['rolling_30d']), 2)
        ) for _, row in daily_df.tail(60).iterrows()]

    def _calculate_acwr(self, df: pd.DataFrame) -> Optional[AcwrStatus]:
        """ 부상 위험 방지 지표 """
        if df.empty:
            return None

        try :
            # 1. 날짜를 시/분/초 없는 00:00:00 날짜 전용 타임스탬프로 정규화 (Normalize)
            df_copy = df.copy()
            df_copy['pure_date'] = pd.to_datetime(df_copy['run_date']).dt.normalize()

            # 동일 일자 러닝 합계 
            daily_sum = df_copy.groupby('pure_date')['distance_km'].sum()

            if daily_sum.empty:
                return None

            min_date = daily_sum.index.min()
            max_date = daily_sum.index.max()
            all_dates = pd.date_range(start=min_date, end=max_date, freq='D')

            # 연속 날짜로 재인덱싱 (운동 없는날 o )
            daily_df = daily_sum.reindex(all_dates, fill_value=0.0).to_frame(name='distance_km')

            
            # 이동평균 연산 
            daily_df['acute_ewma'] = daily_df['distance_km'].ewm(span=7, adjust=False).mean()

            daily_df['chronic_ewma'] = daily_df['distance_km'].ewm(span=28, adjust=False).mean()

            # 가장 최근 날짜의 ewma 수치
            latest_row = daily_df.iloc[-1]
            acute_val = float(latest_row['acute_ewma'])
            chronic_val = float(latest_row['chronic_ewma'])

            if chronic_val == 0:
                return AcwrStatus(
                    acute_workload=0.0, 
                    chronic_workload=0.0, 
                    acwr_ratio=0.0, 
                    risk_level="UNDER", 
                    insight_text="훈련 데이터가 부족하여 ACWR 연산 대기 중입니다."
                )

            # ewma 기반 acwr 비율 산출
            acwr_ratio = round(acute_val / chronic_val , 2)

            # 등급 판정 및 조언 문구
            if acwr_ratio < 0.8:
                risk_level = "UNDER"
                insight_text = f"현재 EWMA ACWR 지수는 {acwr_ratio}입니다. 피로가 충분히 해소되었으니 강도를 올리셔도 좋습니다."
            elif 0.8 <= acwr_ratio <= 1.3:
                risk_level = "SAFE"
                insight_text = f"이상적인 EWMA 훈련 비율을 유지하고 있습니다 (ACWR: {acwr_ratio}). 부상 위험 안전 지대입니다!"
            elif 1.3 < acwr_ratio <= 1.5:
                risk_level = "WARNING"
                insight_text = f"최근 훈련 강도가 다소 높습니다 (ACWR: {acwr_ratio}). 휴식일을 늘려 피로도를 낮추세요."
            else:
                risk_level = "DANGER"
                insight_text = f"EWMA 피로 지수 급증 (ACWR: {acwr_ratio}). 급격한 부하 증가로 부상 위험이 높으니 조깅이나 휴식을 권장합니다."

            return AcwrStatus(
                acute_workload=round(acute_val, 2),
                chronic_workload=round(chronic_val, 2),
                acwr_ratio=acwr_ratio,
                risk_level=risk_level,
                insight_text=insight_text
            )
        except Exception as e:
            print(f"ACWR 계산 중 예외 발생: {e}")
            return AcwrStatus(
                acute_workload=0.0,
                chronic_workload=0.0,
                acwr_ratio=0.0,
                risk_level="UNDER",
                insight_text="ACWR 연산 중 오류가 발생하여 기본값으로 표시합니다."
            )
    
    def _calculate_heatmap(self, df: pd.DataFrame) -> Optional[HeatmapInsight] :
        """ 요일별 시간대별 러닝 파워 맵 """
        if df.empty : 
            return None

        weekday_map ={0: '월', 1: '화', 2: '수', 3: '목', 4: '금', 5: '토', 6: '일'}
        df['weekday'] = df['run_datetime'].dt.weekday.map(weekday_map)
        df['time_slot'] = df['run_datetime'].dt.hour.apply(get_time_slot)

        grouped = df.groupby(['weekday', 'time_slot']).agg({'run_record_id' : 'count', 'avg_pace_sec' : 'mean'}).reset_index()

        points = []
        best_row = None
        min_pace = float('inf')

        for _, row in grouped.iterrows():
            pace = int (row['avg_pace_sec']) if pd.notna(row['avg_pace_sec']) and row['avg_pace_sec'] > 0 else None
            points.append(HeatmapPoint(
                weekday=row['weekday'],
                time_slot=row['time_slot'],
                run_count=int(row['run_record_id']),
                avg_pace_sec=pace                
            ))

            if pace and pace < min_pace :
                min_pace = pace
                best_row = row

        if best_row is not None:
            m = min_pace // 60
            s = min_pace % 60
            best_slot_text = f"데이터 분석 결과, 회원님은 '{best_row['weekday']}요일 {best_row['time_slot']}'에 평균 {m}'{s:02d}\"로 가장 빠르게 달리십니다!"
        else:
            best_slot_text = "다양한 시간대에 운동하시면 최적의 러닝 핫스팟이 연산됩니다."

        return HeatmapInsight(best_slot_text=best_slot_text, points= points)