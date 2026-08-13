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
    AnalyticsSummaryResponse,
    CoachRecommendation,
    HrZoneDistribution
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

    def build_analytics(self, target_year_month: Optional[str] = None) -> AnalyticsSummaryResponse:
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

        # 선택한 연월이 있으면 해당 월의 말일까지의 데이터만 필터링
        if target_year_month:
            try:
                target_period = pd.Period(target_year_month, freq='M')
                cutoff_date = target_period.end_time
                df_target = df[df['run_datetime'] <= cutoff_date].copy()
            except Exception :
                target_period = df['run_datetime'].dt.to_period('M').max()
                df_target = df.copy()

        else :
            target_period = df['run_datetime'].dt.to_period('M').max()
            df_target = df.copy()

        if df_target.empty:
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

        acwr_status = self._calculate_acwr(df)

        return AnalyticsSummaryResponse(
            runner_id=self.runner_id,
            total_distance_km=round(float(df_target['distance_km'].sum()), 2),
            total_runs=len(df_target),
            growth=self._calculate_growth(df_target, target_year_month=str(target_period)),
            rolling_trends=self._calculate_rolling_trends(df_target),
            acwr=self._calculate_acwr(df),
            heatmap=self._calculate_heatmap(df),
            coach_recommendation=self._calculate_coach_recommendation(acwr_status),
            hr_zones=self._calculate_hr_zones(df),
            garmin_analytics=None
        )

    def _calculate_growth(self, df:pd.DataFrame, target_year_month: Optional[str]=None) -> Optional[GrowthInsight]:
        """ 전월 / 전년 동월 성장 추이 분석 """
        if df.empty:
            return None

        # 월 단위 집계 
        df_copy = df.copy()
        df_copy['year_month'] = df_copy['run_datetime'].dt.to_period('M')
        df_copy['day'] = df_copy['run_datetime'].dt.day

        # 기준 월 결정
        if target_year_month:
            try :
                latest_period = pd.Period(target_year_month, freq='M')
            except Exception : 
                latest_period = df_copy['year_month'].max()
        else :
            latest_period = df_copy['year_month'].max()

        # 기준월 데이터 추출
        current_month_df = df_copy[df_copy['year_month'] == latest_period]
        if current_month_df.empty:
            return GrowthInsight(
                mom_distance_change_pct=None,
                mom_pace_change_sec=None,
                yoy_distance_change_pct=None,
                yoy_pace_change_sec=None,
                # 선택한 월의 데이터가 없을 때도 명시적으로 None 지정
                current_mtd_distance_km=None,
                prev_month_mtd_distance_km=None,
                prev_year_mtd_distance_km=None,
                max_day=None,
                insight_text=f"{latest_period} 선택한 월의 러닝 기록이 없습니다."
            )

        #MTD 기준일자 계산 
        # 이번 달 러닝 기록중 가장 마지막 날짜 
        #max_day = current_month_df['day'].max()
        today_period = pd.Period(datetime.now(), freq='M')
        is_past_month = latest_period < today_period

        if is_past_month:
             # 과거 완료된 달: 31일 데이터를 포함한 전체 월 100% 비교!
            max_day = latest_period.days_in_month
            current_mtd_df = current_month_df
            
            prev_period = latest_period - 1
            prev_month_df = df_copy[df_copy['year_month'] == prev_period]
            
            prev_year_period = latest_period - 12
            prev_year_df = df_copy[df_copy['year_month'] == prev_year_period]
        else :
            max_day = datetime.now().day
            current_mtd_df = current_month_df[current_month_df['day'] <= max_day]
            
            prev_period = latest_period - 1
            prev_month_df = df_copy[(df_copy['year_month'] == prev_period) & (df_copy['day'] <= max_day)]
            
            prev_year_period = latest_period - 12
            prev_year_df = df_copy[(df_copy['year_month'] == prev_year_period) & (df_copy['day'] <= max_day)]

        # 이번달 MTD 데이터 집계
        current_dist = float(current_mtd_df['distance_km'].sum())
        current_pace = current_mtd_df['avg_pace_sec'].mean()
        current_hr = current_mtd_df['avg_hr'].dropna().mean() # 평균 심박 추출

        # 심폐 효율성 지수 계산
        current_eff = None
        if pd.notna(current_pace) and current_pace > 0 and pd.notna(current_hr) and current_hr > 0:
            current_speed_kmh = 3600.0 / current_pace
            current_eff = (current_speed_kmh / current_hr) * 100.0

        mom_dist_pct, mom_pace_diff, mom_hr_diff, mom_eff_pct = None, None, None, None
        prev_dist, prev_hr = 0.0 , None

        if not prev_month_df.empty:
            prev_dist = float(prev_month_df['distance_km'].sum())
            prev_pace = prev_month_df['avg_pace_sec'].mean()
            prev_hr = prev_month_df['avg_hr'].dropna().mean()

            if prev_dist > 0 :
                mom_dist_pct = round(((current_dist - prev_dist)/prev_dist) * 100, 1)
            if pd.notna(current_pace) and pd.notna(prev_pace) :
                mom_pace_diff = int(current_pace - prev_pace)
            if pd.notna(current_hr) and pd.notna(prev_hr):
                mom_hr_diff = int(current_hr - prev_hr) # 이면 심박 감소 (강화)

                # 전월 심폐 효율성 및 변화율
                if prev_pace > 0 and prev_hr > 0 and current_eff:
                    prev_speed_kmh = 3600.0 / prev_pace
                    prev_eff = (prev_speed_kmh / prev_hr) * 100.0
                    if prev_eff > 0 : 
                        mom_eff_pct = round(((current_eff - prev_eff) / prev_eff) * 100 , 1)

        yoy_dist_pct, yoy_pace_diff, yoy_hr_diff, yoy_eff_pct = None, None, None, None
        prev_year_dist = 0.0

        if not prev_year_df.empty:
            prev_year_dist = float(prev_year_df['distance_km'].sum())
            prev_year_pace = prev_year_df['avg_pace_sec'].mean()
            prev_year_hr = prev_year_df['avg_hr'].dropna().mean()

            if prev_year_dist > 0:
                yoy_dist_pct = round(((current_dist - prev_year_dist)/prev_year_dist) * 100, 1)
            if pd.notna(current_pace) and pd.notna(prev_year_pace):
                yoy_pace_diff = int(current_pace - prev_year_pace)
            if pd.notna(current_hr) and pd.notna(prev_year_hr):
                yoy_hr_diff = int(current_hr - prev_year_hr)
                if prev_year_pace > 0 and prev_year_hr > 0 and current_eff:
                    prev_year_speed_kmh = 3600.0 / prev_year_pace
                    prev_year_eff = (prev_year_speed_kmh / prev_year_hr) * 100.0
                    if prev_year_eff > 0 :
                        yoy_eff_pct = round(((current_eff - prev_year_eff)/ prev_year_eff) * 100, 1)

        # MTD 맞춤형 사용자 인사이트 구성
        insight_parts = []
        if mom_dist_pct is not None:
            sign = "+" if mom_dist_pct >= 0 else ""
            insight_parts.append(f"지난달 {max_day}일까지 대비 이번 달 {max_day}일까지 거리는 {sign}{mom_dist_pct}% 변화했습니다.")
        if mom_hr_diff is not None : 
            if mom_hr_diff < 0 :
                insight_parts.append(f"평균 심박수가 {abs(mom_hr_diff)}bpm 낮아져 심폐 지구력이 강화되엇습니다.")
            elif mom_hr_diff > 0 :
                insight_parts.append(f"평균 심박수가 {mom_hr_diff}bpm 상승하였습니다.")

        text = " ".join(insight_parts) if insight_parts else "데이터를 축적하면 심폐 성과 인사이트가 제공됩니다."
        return GrowthInsight(
            mom_distance_change_pct=mom_dist_pct,
            mom_pace_change_sec=mom_pace_diff,
            yoy_distance_change_pct=yoy_dist_pct,
            yoy_pace_change_sec=yoy_pace_diff,
            mom_hr_change_bpm=mom_hr_diff,
            mom_efficiency_change_pct=mom_eff_pct,
            yoy_hr_change_bpm=yoy_hr_diff,
            yoy_efficiency_change_pct=yoy_eff_pct,
            # 💡 선택한 월의 순수 운동 횟수 전달 (예: 8회)
            current_month_run_count=len(current_mtd_df),
            current_avg_hr=int(current_hr) if pd.notna(current_hr) else None,
            prev_month_avg_hr=int(prev_hr) if pd.notna(prev_hr) else None,
            current_mtd_distance_km=round(current_dist, 1),
            prev_month_mtd_distance_km=round(prev_dist, 1) if not prev_month_df.empty else None,
            prev_year_mtd_distance_km=round(prev_year_dist, 1) if not prev_year_df.empty else None,
            max_day=max_day,
            insight_text=text
        )

    def _calculate_rolling_trends(self, df: pd.DataFrame) -> List[RollingTrendPoint] :
        """ 7일 / 30일 평균 훈련 트렌드 """
        if df.empty : 
            return []

        all_dates = pd.date_range(start=df['run_date_dt'].min(), end=df['run_date_dt'].max(), freq='D')

        # avg_hr 집계 추가
        daily_df = df.groupby('run_date_dt').agg({
            'distance_km': 'sum',
            'avg_pace_sec': 'mean',
            'avg_hr': 'mean'
        }).reindex(all_dates, fill_value=0.0).reset_index()

        daily_df.rename(columns={'index':'run_date'}, inplace=True)
        daily_df['rolling_7d'] = daily_df['distance_km'].rolling(window=7, min_periods=1).mean()
        daily_df['rolling_30d'] = daily_df['distance_km'].rolling(window=30, min_periods=1).mean()

        return [RollingTrendPoint(
            run_date=row['run_date'].strftime('%Y-%m-%d'),
            distance_km=round(float(row['distance_km']), 2),
            avg_pace_sec=int(row['avg_pace_sec']) if pd.notna(row['avg_pace_sec']) and row['avg_pace_sec'] > 0 else None,
            rolling_7d_distance=round(float(row['rolling_7d']), 2),
            rolling_30d_distance=round(float(row['rolling_30d']), 2),
            avg_hr=int(row['avg_hr']) if pd.notna(row['avg_hr']) and row['avg_hr'] > 0 else None
        ) for _, row in daily_df.tail(60).iterrows()]

    def _calculate_acwr(self, df: pd.DataFrame) -> Optional[AcwrStatus]:
        """ 부상 위험 방지 지표 """
        if df.empty:
            return None

        try :
            # 1. 날짜를 시/분/초 없는 00:00:00 날짜 전용 타임스탬프로 정규화 (Normalize)
            df_copy = df.copy()
            df_copy['pure_date'] = pd.to_datetime(df_copy['run_date']).dt.normalize()

            # 심박도 강도 가중치 연산 
            # avg_hr 이 있는 경우 (avg_hr / 140.0) 없는 경우 1.0 적용
            def calc_intensity(row) :
                hr = row.get('avg_hr')
                if pd.notna(hr) and hr > 0:
                    return round(float(hr) / 140.0, 2)
                return 1.0

            df_copy['intensity_factor'] = df_copy.apply(calc_intensity, axis=1)

            df_copy['weighted_distance'] = df_copy['distance_km'] * df_copy['intensity_factor']

            # 동일 일자 러닝 합계 
            daily_sum = df_copy.groupby('pure_date')['weighted_distance'].sum()

            if daily_sum.empty:
                return None

            min_date = daily_sum.index.min()
            max_date = daily_sum.index.max()
            all_dates = pd.date_range(start=min_date, end=max_date, freq='D')

            # 연속 날짜로 재인덱싱 (운동 없는날 o )
            daily_df = daily_sum.reindex(all_dates, fill_value=0.0).to_frame(name='weighted_distance')

            
            # 이동평균 연산 
            daily_df['acute_ewma'] = daily_df['weighted_distance'].ewm(span=7, adjust=False).mean()
            daily_df['chronic_ewma'] = daily_df['weighted_distance'].ewm(span=28, adjust=False).mean()

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
        df['weekday_num'] = df['run_datetime'].dt.weekday
        df['weekday'] = df['weekday_num'].map(weekday_map)
        df['time_slot'] = df['run_datetime'].dt.hour.apply(get_time_slot)

        # 요일별 러닝 횟수 미리 계산 (비중)
        weekday_totals = df.groupby('weekday')['run_record_id'].count().to_dict()

        grouped = df.groupby(['weekday_num', 'weekday' , 'time_slot']).agg({
                'run_record_id' : 'count', 
                'avg_pace_sec' : 'mean'
            }).reset_index()

        # 안전필터 : 최소 5회 이상 달린 유의미한 시간대
        grouped_filltered = grouped[grouped['run_record_id'] >= 5]
        if not grouped_filltered.empty :
            grouped = grouped_filltered.sort_values(by='avg_pace_sec', ascending=True)
        else : 
            grouped = grouped.sort_values(by='avg_pace_sec', ascending=True)
        
        points = []
        best_row = None
        min_pace = float('inf')

        for _, row in grouped.iterrows():
            pace = int (row['avg_pace_sec']) if pd.notna(row['avg_pace_sec']) and row['avg_pace_sec'] > 0 else None

            if pace is not None:
                w_day = row['weekday']
                w_total = weekday_totals.get(w_day, int(row['run_record_id']))
                r_count = int(row['run_record_id'])
                s_pct = int(round((r_count/ w_total)*100)) if w_total > 0 else 100

                points.append(HeatmapPoint(
                    weekday=w_day,
                    time_slot=row['time_slot'],
                    run_count=r_count,
                    weekday_total_runs=w_total,
                    slot_pct=s_pct,
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

    def _calculate_coach_recommendation(self, acwr: Optional[AcwrStatus]) -> Optional[CoachRecommendation]:
        """ 실시간 acwr 부하 기반 코칭 액션"""
        if not acwr or acwr.acwr_ratio == 0 :
            return CoachRecommendation(
                action_title="5km 회복 조깅 훈련 추천 🏃‍♂️",
                target_pace_text="06'00\"/km 전후",
                target_hr_text="145 bpm 이하",
                coaching_message="기록 데이터가 축적되면 더 정밀한 맞춤 코칭 플랜이 연산됩니다."
            )

        ratio = acwr.acwr_ratio

        if ratio > 1.4:
            return CoachRecommendation(
                action_title="내일 완전 휴식 권장",
                target_pace_text="휴식 (러닝 자제)",
                target_hr_text="120 bpm 이하 (일상)",
                coaching_message=f"EWMA 피로 부하 지수가 {ratio}로 급증했습니다! 관절 및 근육 부상을 방지하기 위해 내일은 완전 휴식을 추천합니다."
            )
        elif 1.25 < ratio <= 1.4:
            return CoachRecommendation(
                action_title="3km~5km 가벼운 회복 조깅",
                target_pace_text="06'15\"/km ~ 06'45\"/km",
                target_hr_text="140 bpm 이하 (Zone 1~2)",
                coaching_message=f"피로도가 누적되는 주의 단계입니다 (ACWR: {ratio}). 무리한 속도를 피하고 젖산 제거를 위한 가벼운 회복 조깅을 진행하세요."
            )
        elif 0.8 <= ratio <= 1.25:
            return CoachRecommendation(
                action_title="5km~8km 유산소 템포 러닝",
                target_pace_text="05'20\"/km ~ 05'50\"/km",
                target_hr_text="145 ~ 158 bpm (Zone 2~3)",
                coaching_message=f"이상적인 훈련 비율(ACWR: {ratio})을 유지 중입니다! 심폐 지구력 강화를 위한 유산소 템포 러닝을 추천합니다."
            )
        else:
            return CoachRecommendation(
                action_title="8km~10km 지구력 / 인터벌 훈련 추천",
                target_pace_text="05'00\"/km ~ 05'30\"/km",
                target_hr_text="160 bpm 이상 (Zone 3~4)",
                coaching_message=f"피로도가 충분히 회복되었습니다 (ACWR: {ratio}). 강도를 살짝 올려 페이스를 높여보는 훈련에 도전해 보세요!"
            )

    def _calculate_hr_zones(self, df: pd.DataFrame) -> Optional[HrZoneDistribution]:
        """ 심박수 구간 """
        if df.empty or 'avg_hr' not in df.columns:
            return None

        valid_hrs = df['avg_hr'].dropna()
        valid_hrs = valid_hrs[valid_hrs > 0]

        if valid_hrs.empty :
            return None

        total_count = len(valid_hrs)

        z1 = len(valid_hrs[valid_hrs < 135])
        z2 = len(valid_hrs[(valid_hrs >= 135) & (valid_hrs < 151)])
        z3 = len(valid_hrs[(valid_hrs >= 151) & (valid_hrs < 166)])
        z4 = len(valid_hrs[(valid_hrs >= 166) & (valid_hrs < 179)])
        z5 = len(valid_hrs[valid_hrs >= 179])

        z1_pct = round((z1 / total_count) * 100, 1)
        z2_pct = round((z2 / total_count) * 100, 1)
        z3_pct = round((z3 / total_count) * 100, 1)
        z4_pct = round((z4 / total_count) * 100, 1)
        z5_pct = round((z5 / total_count) * 100, 1)
        zone_pcts = {'Zone 1 (회복)': z1_pct, 'Zone 2 (유산소)': z2_pct, 'Zone 3 (템포)': z3_pct, 'Zone 4 (역치)': z4_pct, 'Zone 5 (무산소)': z5_pct}
        primary_zone = max(zone_pcts, key=zone_pcts.get)
        return HrZoneDistribution(
            zone1_pct=z1_pct,
            zone2_pct=z2_pct,
            zone3_pct=z3_pct,
            zone4_pct=z4_pct,
            zone5_pct=z5_pct,
            primary_zone_text=f"주로 '{primary_zone}' 구간({zone_pcts[primary_zone]}%)에서 훈련하셨습니다."
        )