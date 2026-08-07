# stat_service 프로젝트 구조 및 안내 가이드

이 문서는 `stat_service` (FastAPI 기반 통계 및 가민 데이터 수집 마이크로서비스)의 폴더 구조와 각 모듈별 역할에 대해 설명합니다.

---

## 1. 전체 디렉토리 구조 (Directory Layout)

```text
stat_service/
├── .venv/                      # Python 가상 환경
├── main.py                     # FastAPI 진입점 (App 생성 및 라우터 묶음)
├── requirements.txt            # Python 패키지 의존성 목록
├── README.md                   # 서비스 개요 및 실행 방법
├── STRUCTURE.md                # [현재 문서] 폴더 구조 및 역할 상세 안내
│
└── app/                        # 💡 메인 애플리케이션 패키지 Root
    ├── __init__.py
    │
    ├── core/                   # [1] 공통 환경설정 및 DB 연결 관리
    │   ├── __init__.py
    │   ├── config.py           # 환경변수, 앱 설정값 (DB URL, 세션 저장 경로 등)
    │   └── database.py         # SQLAlchemy PostgreSQL DB 세션 및 연결 설정
    │
    ├── db_models/              # [2] PostgreSQL 데이터베이스 ORM 테이블 모델
    │   ├── __init__.py
    │   ├── garmin_models.py    # GARMIN_RUN_DETAIL, GARMIN_RUN_LAP 테이블 정의
    │   └── run_models.py       # RUN_RECORD 관련 참조 테이블 정의
    │
    ├── garmin/                 # [3] 🏃 Garmin Connect 연동 전용 모듈
    │   ├── __init__.py
    │   ├── client.py           # 가민 API 접속 & 세션/토큰 관리 (GarminService)
    │   ├── parser.py           # raw 가민 JSON/FIT -> 서비스 도메인 변환 (GarminDataParser)
    │   ├── service.py          # 수집-변환-DB저장 비즈니스 로직
    │   ├── router.py           # 가민 관련 FastAPI 엔드포인트 (/api/v1/garmin)
    │   └── tokens/             # [git-ignored] 사용자별 가민 세션 토큰 저장 디렉토리
    │
    └── analytics/              # [4] 📊 러닝 데이터 분석 & 통계 계산 모듈
        ├── __init__.py
        ├── router.py           # 통계 관련 FastAPI 엔드포인트 (/api/v1/stats)
        ├── stats_calculator.py # 주간/월간 거리, 페이스, 통계 데이터 계산 로직
        └── models.py           # 통계 응답/요청 Pydantic schemas
```

---

## 2. 각 폴더 및 주요 파일별 역할

### 📌 `main.py`
- FastAPI 서비스의 시작점(Entrypoint)입니다.
- `app/garmin/router.py`와 `app/analytics/router.py`를 하나로 포함(Include)하여 API 웹 서버를 실행시킵니다.

### 📌 `app/core/`
- **`config.py`**: DB 주소, 가민 토큰 저장 디렉토리 경로, 환경변수를 관리합니다.
- **`database.py`**: PostgreSQL 데이터베이스 연결 엔진(Engine)과 세션(SessionLocal)을 생성합니다.

### 📌 `app/garmin/` (가민 연동 전용)
- **`client.py`**: `garminconnect` 패키지를 활용해 최초 1회 로그인 후, 토큰 세션을 `tokens/` 폴더에 덤프하여 재사용하도록 관리합니다.
- **`parser.py`**: 가민에서 수신된 Raw JSON 응답 데이터에서 러닝(`running`) 데이터만 필터링하고 거리(m➔km), 페이스(초➔분'초") 단위를 변환합니다.
- **`service.py`**: `client`로 수집하고 `parser`로 가공한 데이터를 DB에 저장하는 종합 비즈니스 흐름을 담당합니다.
- **`router.py`**: 가민 동기화 수동 요청(`POST /api/v1/garmin/sync`) 등의 HTTP API 경로를 제공합니다.
- **`tokens/`**: OAuth 2.0 세션 토큰이 암호화되어 보관되는 보안 디렉토리입니다.

### 📌 `app/analytics/` (데이터 분석 & 통계 전용)
- **`stats_calculator.py`**: 러닝 기록 DB 데이터를 기반으로 기간별 페이스 추이, 총 달린 거리, 월간 분석 통계를 계산합니다.
- **`router.py`**: 대시보드나 프론트엔드/메인 백엔드에서 조회할 통계 API(`GET /api/v1/stats/...`)를 제공합니다.

### 📌 `app/db_models/`
- PostgreSQL 테이블 구조를 Python 클래스(SQLAlchemy ORM)로 1:1 매핑하여 관리합니다.
