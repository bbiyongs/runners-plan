from sqlalchemy import Column, BigInteger, String, DateTime, Date, Numeric, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class RunRecord(Base):
    """최상위 러닝 기록 테이블"""
    __tablename__ = "run_record"

    run_record_id = Column(BigInteger, primary_key=True, autoincrement=True)
    runner_id = Column(BigInteger, nullable=False)
    shoe_id = Column(BigInteger) # 착용한 러닝화 ID
    run_datetime = Column(DateTime, nullable=False)
    run_date = Column(Date, nullable=False)
    duration_sec = Column(Integer, nullable=False)
    distance_km = Column(Numeric(6, 2), nullable=False)
    avg_pace_sec = Column(Integer)
    avg_hr = Column(Integer)
    max_hr = Column(Integer) # 주행 중 최고/최대 심박수 (BPM)
    condition_score = Column(Integer, default=2) # 1: 무거움, 2: 보통, 3: 상쾌함
    pain_area_code = Column(String(30), default="NONE") # 통증 부위 코드 (CODE_DETAIL)
    pain_level = Column(Integer, default=0) # 0: 없음, 1: 뻐근함, 2: 불편함, 3: 심함
    temperature = Column(Numeric(4, 1))
    humidity = Column(Integer)
    weather_code = Column(String(30))
    memo = Column(String(1000))
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())