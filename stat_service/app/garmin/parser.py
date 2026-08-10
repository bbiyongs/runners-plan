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

        temp = raw.get("temperature") # 기온
        hum = raw.get("relativeHumidity") # 습도

        garmin_w_type = raw.get("weatherTypeDTO", {}).get("weatherTypeKey", "")
        weather_code = None

        if garmin_w_type:
            w_key = garmin_w_type.upper()
            if any(k in w_key for k in ["RAIN", "SHOWER", "THUNDER"]):
                weather_code = "RAIN"
            elif any(k in w_key for k in ["SNOW", "ICE", "FREEZING"]):
                weather_code = "SNOW"
            elif any(k in w_key for k in ["CLOUD", "OVERCAST", "FOG"]):
                weather_code = "CLOUDY"
            elif any(k in w_key for k in ["CLEAR", "SUN"]):
                weather_code = "SUNNY"

        return RunningActivityDTO (
            activity_id=activity_id,
            name=name,
            start_time=start_time,
            distance_km=distance_km,
            duration_minutes=duration_min,
            duration_seconds=duration_sec,
            average_pace_str=avg_pace_str,
            average_pace_sec=avg_pace_sec,
            average_hr=raw.get("averageHR"),
            max_hr=raw.get("maxHR"),
            calories=int(raw.get("calories", 0)),
            # 추가 파싱
            rpe=raw.get("perceivedExertion"),
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