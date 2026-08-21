# Line 1-2
from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, Numeric, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB

from sqlalchemy.sql import func
from app.core.database import Base

class GarminAccountLink(Base):
    """가민 계정 연동 및 동기화 상태 관리 테이블 (1:1)"""
    __tablename__ = "garmin_account_link"
    garmin_link_id = Column(BigInteger, primary_key=True, autoincrement=True)
    runner_id = Column(BigInteger, nullable=False, unique=True)
    garmin_email = Column(String(100), nullable=False)
    token_store_path = Column(String(255))
    is_connected = Column(Boolean, default=True, nullable=False)
    initial_sync_completed = Column(Boolean, default=False, nullable=False)
    last_synced_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())
class GarminRunDetail(Base):
    """가민 정밀 분석 지표 데이터 테이블 (1:1)"""
    __tablename__ = "garmin_run_detail"
    garmin_detail_id = Column(BigInteger, primary_key=True, autoincrement=True)
    run_record_id = Column(BigInteger, ForeignKey("run_record.run_record_id", ondelete="CASCADE"), nullable=False, unique=True)
    garmin_activity_id = Column(BigInteger, nullable=False, unique=True)
    max_hr = Column(Integer)
    avg_cadence = Column(Integer)
    max_cadence = Column(Integer)
    avg_stride_length_mm = Column(Integer)
    elevation_gain_m = Column(Numeric(6, 1))
    elevation_loss_m = Column(Numeric(6, 1))
    vo2_max = Column(Numeric(4, 1))
    training_effect_aerobic = Column(Numeric(3, 1))
    training_effect_anaerobic = Column(Numeric(3, 1))
    calories = Column(Integer)
    gpx_route_json = Column(JSONB)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())
class GarminRunLap(Base):
    """가민 km/구간별 랩 타임 테이블 (1:N)"""
    __tablename__ = "garmin_run_lap"
    lap_id = Column(BigInteger, primary_key=True, autoincrement=True)
    run_record_id = Column(BigInteger, ForeignKey("run_record.run_record_id", ondelete="CASCADE"), nullable=False)
    lap_index = Column(Integer, nullable=False)
    lap_distance_km = Column(Numeric(5, 2), nullable=False)
    lap_duration_sec = Column(Integer, nullable=False)
    lap_avg_pace_sec = Column(Integer)
    lap_avg_hr = Column(Integer)
    lap_max_hr = Column(Integer)
    lap_avg_cadence = Column(Integer)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)