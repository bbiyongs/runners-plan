import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.garmin.router import router as garmin_router
from app.analytics.router import router as analytics_router

app = FastAPI(
    title="Running Coach Stat & Garmin Sync API Service",
    description="러닝 코치 통계 분석 및 Garmin 연동 데이터 수집 마이크로서비스",
    version="1.0.0"
)

# 환경변수에서 CORS 허용 도메인을 읽어오고 없으면 localhost
raw_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in raw_origins.split(",")  if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,         # axiosInstance의 withCredentials:true 와 맞춰야 함
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Garmin 연동
app.include_router(garmin_router)
# 통계 연동
app.include_router(analytics_router)


@app.get("/health")
def health_check() :
    return {
        "status" : "UP",
        "service" : "ruuning stat api",
        "version" : "1.0.0"
    }