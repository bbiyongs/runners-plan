from dataclasses import dataclass
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

@dataclass
class RunningActivityDTO:
    """우리 서비스 도메인에서 사용할 러닝 요약 데이터 모델"""
    activity_id: int
    name: str
    start_time: str                  # 예: "2026-08-06 07:30:00"
    distance_km: float               # 미터(m) -> 킬로미터(km)
    duration_minutes: float          # 초(sec) -> 분(min)
    duration_seconds: int            # 원본 초 데이터
    average_pace_str: Optional[str]   # "5'30\"" 형태의 페이스 문자열
    average_pace_sec: Optional[int]   # 초/km 형태의 정수 (DB 저장용)
    average_hr: Optional[int]        # 평균 심박수
    max_hr: Optional[int]            # 최대 심박수
    calories: int                    # 소모 칼로리
    # 추가 필드 
    rpe: Optional[int] = None
    aerobic_effect: Optional[float] = None        # 유산소 훈련 효과 (0.0~5.0)
    anaerobic_effect: Optional[float] = None      # 무산소 훈련 효과 (0.0~5.0)
    # 기상 관련 필드 추가
    temperature: Optional[float] = None
    humidity: Optional[int] = None
    weather_code: Optional[str] = None


class GarminDataParser:
    """ 가민 raw json 데이터를 서비스 모델로 파싱 """

    @staticmethod
    def parse_running_activity(raw: Dict[str, Any]) -> Optional[RunningActivityDTO]:
        """
        가민 단일 activity raw json 에서 러닝 데이터만 파싱 
        """
        activity_type_key = raw.get("activityType", {}).get("typeKey","")
        if "running" not in activity_type_key.lower():
            return None

        activity_id = raw.get("activityId")
        name = raw.get("activityName", "러닝")
        start_time = raw.get("startTimeLocal", "")

        # 거리 및 시간 단위 변환
        distance_m = raw.get("distance", 0.0)
        duration_sec = int(raw.get("duration", 0))

        distance_km = round(distance_m / 1000.0, 2)
        duration_min = round(duration_sec / 60.0, 1)

        #평균 페이스 계산
        avg_pace_sec = None
        avg_pace_min = None

        if distance_km > 0 and duration_sec > 0 :
            avg_pace_sec = int(duration_sec/ distance_km)
            pace_min = avg_pace_sec // 60
            pace_rem_sec = avg_pace_sec % 60
            avg_pace_str = f"{pace_min}'{pace_rem_sec:02d}\""

                # 1. 기온 데이터 (다양한 키 탐색)
        temp = raw.get("temperature")
        if temp is None:
            temp = raw.get("maxTemperature") or raw.get("minTemperature")
            
        # 2. 습도 데이터 (relativeHumidity, humidity, weatherTypeDTO 내부 탐색)
        hum = raw.get("relativeHumidity")
        if hum is None:
            hum = raw.get("humidity")
        if hum is None and isinstance(raw.get("weatherTypeDTO"), dict):
            hum = raw.get("weatherTypeDTO", {}).get("relativeHumidity") or raw.get("weatherTypeDTO", {}).get("humidity")

        # 3. 날씨 상태 코드 탐색 (PARTLY_CLOUDY, MOSTLY_CLOUDY, MIST 등 키워드 확장)
        weather_code = None
        w_dto = raw.get("weatherTypeDTO")
        w_key = ""
        if isinstance(w_dto, dict):
            w_key = str(w_dto.get("weatherTypeKey") or w_dto.get("weatherType") or "").upper()

        if w_key:
            if any(k in w_key for k in ["RAIN", "SHOWER", "THUNDER", "DRIZZLE", "PRECIP"]):
                weather_code = "RAIN"
            elif any(k in w_key for k in ["SNOW", "ICE", "FREEZING", "HAIL", "SLEET"]):
                weather_code = "SNOW"
            elif any(k in w_key for k in ["CLOUD", "OVERCAST", "FOG", "MIST", "HAZE", "PARTLY", "MOSTLY"]):
                weather_code = "CLOUDY"
            elif any(k in w_key for k in ["CLEAR", "SUN", "FAIR"]):
                weather_code = "SUNNY"

        # rpe 파싱  및 자동추정 로직 
        # 💡 가민 실제 RPE 필드: directWorkoutRpe (예: 20 -> 2점) 및 perceivedExertion 파싱
        raw_rpe = (
            raw.get("directWorkoutRpe") 
            or raw.get("perceivedExertion") 
            or raw.get("userPerceivedExertion")
        )
        
        # summaryDTO 내부 객체가 포함되어 있는 경우 추가 검사
        raw_rpe = raw.get("perceivedExertion") or raw.get("directWorkoutRpe")
        calculated_rpe = None

        # 수동 입력 RPE 가 JSON 에 존재하는 경우 
        if raw_rpe is not None:
            try:
                rpe_val = float(raw_rpe)
                if rpe_val >= 10:
                    rpe_val = round(rpe_val/10.0)
                calculated_rpe = max(1, min(10, int(rpe_val)))
            except (ValueError, TypeError):
                calculated_rpe = None

        # 수동 RPE가 없을 경우: get_activities 기본 항목인 aerobicTrainingEffect 지표로 RPE (1~10) 자동 계산
        # RPE 는 상세 정보를 호출해와야 가능한 값이라 따로 계산 
        # 유산소 훈련 효과 지표 (0.0 ~ 5.0 수치) - aerobicTrainingEffect
        if calculated_rpe is None:
            # None 방어 구문 (None이 들어오면 0.0으로 안전 변환)
            val_aerobic = raw.get("aerobicTrainingEffect")
            val_anaerobic = raw.get("anaerobicTrainingEffect")
            val_hr = raw.get("averageHR")

            aerobic_eff = float(val_aerobic) if val_aerobic is not None else 0.0
            anaerobic_eff = float(val_anaerobic) if val_anaerobic is not None else 0.0
            avg_hr = float(val_hr) if val_hr is not None else 0.0

            # 유산소 훈련 효과 기준점수 ( 0 - 5 -> 0 - 7 스케일)
            score = aerobic_eff * 1.4

            # 심박수 기반 미세 가중치 ( 130 - 160 구간에 0.0 - 1.5 가산)
            if avg_hr > 130:
                hr_bonus = min(1.5, (avg_hr-130) * 0.05)
                score += hr_bonus
            elif avg_hr > 0 and avg_hr < 120:
                score -= 0.5  # 심박이 낮으면 -0.5 점

            # 무산소 자극이 있는경우 최대 1.0 추가
            if anaerobic_eff > 1.0 : 
                score += min(1.0, (anaerobic_eff - 1.0) * 0.5)

            # 반올림 해서 1 - 10 사이 정수로 안착 
            calculated_rpe = max(1, min(10, round(score)))


        # 💡 만약 가민에 기상 키가 아예 없는 경우 None 반환
        logger.info(f"연동중 날씨  변환 코드 : {weather_code} 가민 코드 : {w_key}")

        return RunningActivityDTO (
            activity_id=activity_id,
            name=name,
            start_time=start_time,
            distance_km=distance_km,
            duration_minutes=duration_min,
            duration_seconds=duration_sec,
            average_pace_str=avg_pace_str,
            average_pace_sec=avg_pace_sec,
            average_hr=int(round(raw.get("averageHR") or raw.get("averageHeartRate"))) if (raw.get("averageHR") or raw.get("averageHeartRate")) is not None else None,
            max_hr=int(round(raw.get("maxHR") or raw.get("maxHeartRate"))) if (raw.get("maxHR") or raw.get("maxHeartRate")) is not None else None,
            calories=int(raw.get("calories", 0)),
            # 추가 파싱
            rpe=calculated_rpe,
            aerobic_effect=raw.get("aerobicTrainingEffect"),
            anaerobic_effect=raw.get("anaerobicTrainingEffect"),
            # 기상데이터
            temperature=temp,
            humidity=hum,
            weather_code=weather_code
        )
    @classmethod
    def parse_activities_list(cls, raw_list: List[Dict[str, Any]]) -> List[RunningActivityDTO]:
        """활동 목록 배열 중 러닝 기록만 추출하여 파싱 리스트로 변환"""
        parsed_runs =[]
        for raw in raw_list:
            parsed = cls.parse_running_activity(raw)
            if parsed :
                parsed_runs.append(parsed)
        return parsed_runs