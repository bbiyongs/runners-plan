import os
from jose import JWTError, jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Backend Spring Boot와 동일한 JWT Secret (환경변수로 관리)
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

# Authorization: Bearer <token> 형식의 헤더를 파싱하는 스키마
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> int:
    """
    JWT Access Token을 검증하고 runner_id(int)를 반환합니다.
    라우터 함수에서 Depends(verify_token) 로 주입해 사용합니다.

    검증 실패 시 HTTP 401 Unauthorized를 반환합니다.
    """
    if not JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 JWT 설정이 올바르지 않습니다. 관리자에게 문의하세요."
        )

    token = credentials.credentials
    try:
        # Backend Spring Boot와 동일한 HS256 알고리즘, 동일한 Secret으로 검증
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Spring Boot JwtTokenProvider에서 subject에 runnerId를 문자열로 저장
        runner_id_str: str = payload.get("sub")
        if runner_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="토큰에 사용자 정보가 없습니다."
            )
        return int(runner_id_str)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않거나 만료된 토큰입니다. 다시 로그인해 주세요."
        )
