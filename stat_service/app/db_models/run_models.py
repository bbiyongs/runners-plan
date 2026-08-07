from sqlalchemy import Column, BigInteger, String, DateTime, Date, Numeric, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class RunRecord(Base):
    """최상위 러닝 기록 테이블"""
    __tablename__ = "run_record"

    run_record_id = Column(BigInteger, primary_key=True, autoincrement=True)
    runner_id = Column(BigInteger, nullable=False)
    run_datetime = Column(DateTime, nullable=False)
    run_date = Column(Date, nullable=False)
    duration_sec = Column(Integer, nullable=False)
    distance_km = Column(Numeric(6, 2), nullable=False)
    avg_pace_sec = Column(Integer)
    avg_hr = Column(Integer)
    training_type_code = Column(String(30), default="EASY", nullable=False)
    rpe = Column(Integer)
    temperature = Column(Numeric(4, 1))
    humidity = Column(Integer)
    weather_code = Column(String(30))
    memo = Column(String(1000))
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())