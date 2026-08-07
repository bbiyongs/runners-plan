from fastapi import FastAPI
from app.garmin.router import router as garmin_router

app = FastAPI(
    title="Running Coach Stat & Garmin Sync API Service",
    description="러닝 코치 통계 분석 및 Garmin 연동 데이터 수집 마이크로서비스",
    version="1.0.0"
)

# Garmin 연동
app.include_router(garmin_router)

@app.get("/health")
def health_check() :
    return {
        "status" : "UP",
        "service" : "ruuning stat api",
        "version" : "1.0.0"
    }