from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.auth import verify_token
from app.analytics.models import AnalyticsSummaryResponse
from app.analytics.stats_calculator import AnalyticsCalculator

router = APIRouter(
    prefix="/api/v1/stats",
    tags=["analytics & Statistics"]
)

@router.get("/analytics/{runner_id}", response_model=AnalyticsSummaryResponse)
def get_runner_analytics(
    runner_id: int, 
    target_year_month: Optional[str] = None,    # YYYY-MM 형식
    db: Session = Depends(get_db), 
    token_runner_id : int = Depends(verify_token)
):
    if token_runner_id != runner_id : 
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="접근 권한이 없습니다.")
    
    try : 
        calculator = AnalyticsCalculator(db=db, runner_id=runner_id)
        return calculator.build_analytics(target_year_month=target_year_month)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"통계 분석 데이터 계산중 오류 발생 : {str(e)}"
        )