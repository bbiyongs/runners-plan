import os
import logging
from typing import Optional
from garminconnect import (
    Garmin,
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

logger = logging.getLogger(__name__)

class GarminService:
    def __init__(self, email: str, password: str, token_store_dir: str = None):
        self.email = email
        self.password = password
        
        if token_store_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            token_store_dir = os.path.join(base_dir, "tokens")
            
        safe_email_folder = email.replace("@", "_at_").replace(".", "_")
        self.token_dir = os.path.join(token_store_dir, safe_email_folder)
        self.client: Optional[Garmin] = None

    def get_client(self) -> Garmin:
        """
        저장된 토큰 디렉토리가 있으면 세션 로드 
        없을 경우 로그인 후 세션 토큰 저장
        """
        os.makedirs(self.token_dir, exist_ok=True)

        try :
            logger.info(f"[{self.email}] Garmin 로그인 및 세션 관리 시도 ")

            # Garmin 객체 생성
            self.client = Garmin(self.email, self.password)

            #token_store 디렉토리 경로 넘겨서 로그인
            self.client.login(self.token_dir)

            logger.info(f"[{self.email}] Garmin 로그인 성공")
            return self.client
        
        except GarminConnectAuthenticationError as e:
            logger.error(f"인증 실패 (이메일/비밀번호 확인): {e}")
            raise
        except GarminConnectTooManyRequestsError as e:
            logger.error(f"요청 횟수 초과 (잠시 후 재시도): {e}")
            raise
        except GarminConnectConnectionError as e:
            logger.error(f"가민 서버 통신 오류: {e}")
            raise