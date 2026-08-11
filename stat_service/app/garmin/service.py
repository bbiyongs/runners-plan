import os
import time
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.garmin.client import GarminService
from app.garmin.parser import GarminDataParser, RunningActivityDTO
from app.db_models.garmin_models import GarminAccountLink, GarminRunDetail, GarminRunLap
from app.garmin.weather_fetcher import WeatherFetcher
from app.db_models.run_models import RunRecord

logger = logging.getLogger(__name__)

class GarminSyncService:
    """가민데이터 수집 및 db 저장 """

    def __init__(self, db:Session):
        self.db = db

    def link_account(self, runner_id: int, garmin_email: str, garmin_password: str) -> GarminAccountLink:
        """
        가민 로그인 검증 / 토큰 생성
        Garmin_account_link 테이블에 연동 정보 저장/ 업데이트
        """

        # 가민 인증 검증 및 세션 토큰 생성
        client_service = GarminService(email=garmin_email, password=garmin_password)
        client_service.get_client() # 로그인 성공시 토큰 저장

        #기존 연동정보 확인
        link = self.db.query(GarminAccountLink).filter(GarminAccountLink.runner_id == runner_id).first()
        if not link : 
            link = GarminAccountLink(runner_id=runner_id)

        link.garmin_email = garmin_email
        link.token_store_path = client_service.token_dir
        link.is_connected = True
        link.updated_at = datetime.now()

        self.db.add(link)
        self.db.commit()
        self.db.refresh(link)
        return link

    def save_running_activity(self, runner_id: int, run_dto: RunningActivityDTO, weather_map: dict = None) -> Optional[RunRecord]:
        """
        단일 러닝 활동을 DB에 저장합니다.
        - 동일 날짜 수동 등록 기록 존재 시 삭제 및 메모 승계 후 가민 기록으로 대체
        - 이미 저장된 가민 activity_id가 있으면 스킵 (중복 방지)
        """

        # 이미 동일한 garmin_activity 가 있는지 확인
        existing_detail = self.db.query(GarminRunDetail).filter(GarminRunDetail.garmin_activity_id == run_dto.activity_id).first()

        if(existing_detail) :
            logger.info(f"이미 존재함 : act_id {run_dto.activity_id}")
            return None

        #날짜 파싱
        run_dt = datetime.strptime(run_dto.start_time, "%Y-%m-%d %H:%M:%S")
        run_date = run_dt.date()

        # 동일 날짜 수동 입력기록 조회 
        manual_memo = None
        existing_manual = self.db.query(RunRecord).filter(RunRecord.runner_id == runner_id, RunRecord.run_date == run_date).first()

        if(existing_manual) :
            is_manual = self.db.query(GarminRunDetail).filter(GarminRunDetail.run_record_id == existing_manual.run_record_id).first() is None

            if is_manual :
                logger.info(f"{run_date} 기존 수동입력 데이터 -> 가민데이터로 변경")
                manual_memo = existing_manual.memo
                self.db.delete(existing_manual)
                self.db.flush()


        # 1. 훈련 유형 자동 분류 (DTO 사용)
        aerobic_eff = run_dto.aerobic_effect or 0.0
        anaerobic_eff = run_dto.anaerobic_effect or 0.0
        training_code = "EASY"
        if anaerobic_eff >= 2.5:
            training_code = "INTERVAL"
        elif run_dto.distance_km >= 15.0:
            training_code = "LSD"
        elif aerobic_eff >= 4.0:
            training_code = "TEMPO"
        elif aerobic_eff < 2.0 and aerobic_eff > 0:
            training_code = "RECOVERY"

        # 2. 날씨 데이터 완성 (WeatherFetcher 맵 활용)
        final_temp = run_dto.temperature
        final_hum = run_dto.humidity
        final_weather_code = run_dto.weather_code

        if weather_map:
            hour_key = run_dto.start_time[:13]
            if hour_key in weather_map:
                o_temp, o_hum, o_weather_code = weather_map[hour_key]
                if final_temp is None: final_temp = o_temp
                if final_hum is None: final_hum = o_hum
                if final_weather_code is None: final_weather_code = o_weather_code

        # 3. RunRecord 저장
        new_record = RunRecord(
            runner_id=runner_id,
            run_datetime=run_dt,
            run_date=run_date,
            duration_sec=run_dto.duration_seconds,
            distance_km=run_dto.distance_km,
            avg_pace_sec=run_dto.average_pace_sec,
            avg_hr=run_dto.average_hr,
            training_type_code=training_code,
            rpe=run_dto.rpe,
            temperature=final_temp,
            humidity=final_hum,
            weather_code=final_weather_code or "SUNNY",
            memo=manual_memo or f"Garmin 연동 ({run_dto.name})"
        )
        self.db.add(new_record)
        self.db.flush()

        # Garmin_run_detail 저장
        detail = GarminRunDetail(
            run_record_id=new_record.run_record_id,
            garmin_activity_id=run_dto.activity_id,
            max_hr=run_dto.max_hr,
            calories=run_dto.calories
        )
        self.db.add(detail)
        self.db.commit()
        return new_record

    def sync_initial_history(self, runner_id: int) -> int:
        """
        초기 선택적 과거 전체 데이터 동기화 
        """
        link = self.db.query(GarminAccountLink).filter(GarminAccountLink.runner_id == runner_id).first()
        if not link or not link.is_connected:
            raise ValueError("가민 연동정보가 없습니다.")

        service = GarminService(email=link.garmin_email, password="", token_store_dir=os.path.dirname(link.token_store_path))
        client = service.get_client()

        total_count = client.count_activities()
        batch_size =100
        saved_total = 0
        start = 0

        while start < total_count :
            raw_activities = client.get_activities(start, batch_size)
            if not raw_activities:
                break

            running_dtos = GarminDataParser.parse_activities_list(raw_activities)

            # Open-Meteo 1회 배치 날씨 조회 (0.2초)
            weather_map = {}
            if running_dtos:
                dates = [dto.start_time[:10] for dto in running_dtos]
                weather_map = WeatherFetcher.fetch_batch_map(min(dates), max(dates))

            for dto in running_dtos:
                try :
                    res = self.save_running_activity(runner_id, dto, weather_map=weather_map)
                    if res:
                        saved_total += 1
                except Exception as item_err : 
                    logger.warning(f"활동 ID {dto.activity_id} 저장중 스킵 : {item_err}")
                    self.db.rollback() # 세션 롤백 후 진행

            start += batch_size

            if len(raw_activities) < batch_size:
                break

            time.sleep(0.1) # 가민 서버 차단 방지간격

        link.initial_sync_completed = True
        link.last_synced_at = datetime.now()
        self.db.commit()
        return saved_total


    def sync_recent(self, runner_id: int, limit: int =10)-> int :
        """
        데일리 최신 데이터 동기화 
        """
        link = self.db.query(GarminAccountLink).filter(GarminAccountLink.runner_id == runner_id).first()
        if not link or not link.is_connected:
            raise ValueError("가민 연동정보가 없습니다.")

        service = GarminService(email=link.garmin_email, password="", token_store_dir=os.path.dirname(link.token_store_path))
        client = service.get_client()

        raw_activities = client.get_activities(0, limit)
        running_dtos = GarminDataParser.parse_activities_list(raw_activities)

        weather_map = {}
        if running_dtos:
            dates = [dto.start_time[:10] for dto in running_dtos]
            weather_map = WeatherFetcher.fetch_batch_map(min(dates), max(dates))

        saved_count = 0
        for dto in running_dtos:
            res = self.save_running_activity(runner_id, dto, weather_map=weather_map)
            if res : 
                saved_count += 1


        link.last_synced_at = datetime.now()
        self.db.commit()
        return saved_count

