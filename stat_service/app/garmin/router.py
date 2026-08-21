from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db,SessionLocal
from app.core.auth import verify_token # 인증 추가
from app.garmin.service import GarminSyncService

router = APIRouter(
    prefix="/api/v1/garmin",
    tags=["Garmin Integration"]
)

# 요청 / 응답 pydantic schemas
class GarminConnectRequest(BaseModel) :
    # runner_id: int  토큰에서 추출
    garmin_email: str
    garmin_password: str

class GarminSyncResponse(BaseModel):
    success: bool
    message: str
    saved_count: int = 0

# API Endpoints
@router.post("/connect", summary="Garmin 계정 연동 및 세션생성")
def connect_garmin_account(req: GarminConnectRequest, db: Session = Depends(get_db), runner_id: int = Depends(verify_token)):
    """
    사용자의 가민 id/pw 받아서 인증하고 OAuth 세션 토큰 생성
    """
    try:
        service = GarminSyncService(db)
        link = service.link_account(
            runner_id=runner_id,
            garmin_email=req.garmin_email,
            garmin_password=req.garmin_password
        )
        return {
            "success": True,
            "message": "Garmin 계정이 성공적으로 연동되었습니다.",
            "runner_id": link.runner_id,
            "garmin_email": link.garmin_email
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Garmin 연동 실패 {e}"
        )

def run_background_initial_sync(runner_id:int) :
    """백그라운드에서 별도 DB 세션으로 장시간 동기화 실행"""
    db = SessionLocal()
    try:
        service = GarminSyncService(db)
        service.sync_initial_history(runner_id)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"[백그라운드 동기화 실패] runner_id: {runner_id}, error: {e}")
    finally:
        db.close()

@router.post("/sync-initial/{runner_id}", summary="과거 전체데이터 초기 동기화")
def sync_initial_history(
    runner_id: int,
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db), 
    token_runner_id: int = Depends(verify_token)):
    """
    마이페이지 [Garmin 전체 기록 가져오기] 버튼 클릭 시 호출됩니다.
    과거의 모든 러닝 기록을 백그라운드 페이징으로 가져와 저장합니다.
    """
    if token_runner_id != runner_id : 
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="접근 권한이 없습니다.")

    background_tasks.add_task(run_background_initial_sync, runner_id)

    return GarminSyncResponse(
        success=True,
        message="과거 전체 기록 동기화가 백그라운드에서 시작되었습니다. 잠시 후 새로고침해 주세요.",
        saved_count=0
    )



@router.post("/sync-recent/{runner_id}", summary="최근 데이터 수동 동기화 ")
def sync_recent_activities(runner_id:int, limit: int=10, db: Session=Depends(get_db), token_runner_id: int= Depends(verify_token)):
    """
    러닝 기록 리스트/대시보드 [최신 기록 동기화 🔄] 버튼 클릭 시 호출됩니다.
    최근 N개의 데이터 중 새로 추가된 러닝 데이터만 가져옵니다.
    """
    if token_runner_id != runner_id : 
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="접근 권한이 없습니다.")

    try:
        service = GarminSyncService(db)
        saved_count = service.sync_recent(runner_id, limit=limit)
        return GarminSyncResponse(
            success=True,
            message=f"최근 데이터 동기화 완료 ({saved_count}개 추가됨)",
            saved_count=saved_count
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"최근 동기화 중 오류 발생: {str(e)}")

@router.get("/status/{runner_id}", summary="garmin 연동상태 조회")
def get_garmin_status(runner_id: int, db: Session = Depends(get_db), token_runner_id : int = Depends(verify_token)):
    """
    마이페이지 진입 시 연동 여부 및 최근 동기화 시각 조회
    """
    if token_runner_id != runner_id : 
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="접근 권한이 없습니다.")
    
    from app.db_models.garmin_models import GarminAccountLink
    link = db.query(GarminAccountLink).filter(GarminAccountLink.runner_id == runner_id).first()

    if not link :
        return {
            "is_connected": False,
            "garmin_email": None,
            "initial_sync_completed": False,
            "last_synced_at": None
        }

    return {
        "is_connected": link.is_connected,
        "garmin_email": link.garmin_email,
        "initial_sync_completed": link.initial_sync_completed,
        "last_synced_at": link.last_synced_at.isoformat() if link.last_synced_at else None
    }