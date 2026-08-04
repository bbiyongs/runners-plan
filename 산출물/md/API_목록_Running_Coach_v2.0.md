# Running Coach (러닝 코치) API 목록 및 명세서 (v2.0 MVP)

**문서 작성일**: 2026년 8월 4일  
**버전**: v2.0 (1차 MVP 경량화 버전)  
**기반 아키텍처**: Spring Boot 3.x (Core API) & Python FastAPI (Stat API)  

---

## 1. API 목록 요약

| 순번 | 서비스 구분 | HTTP Method | API Endpoint | 기능명 | 비고 |
| :---: | :--- | :---: | :--- | :--- | :--- |
| 1 | Auth Service | POST | `/api/v1/auth/login` | 소셜 OAuth2 로그인 | JWT 발급 |
| 2 | Auth Service | POST | `/api/v1/auth/refresh` | Access Token 갱신 | Refresh Token 이용 |
| 3 | User Service | GET | `/api/v1/users/me` | 내 프로필 정보 조회 | - |
| 4 | Run Service | POST | `/api/v1/runs` | 러닝 기록 등록 | - |
| 5 | Run Service | GET | `/api/v1/runs` | 러닝 기록 목록 조회 | 페이징 & 월별 필터 |
| 6 | Run Service | GET | `/api/v1/runs/{id}` | 러닝 기록 상세 조회 | - |
| 7 | Run Service | PUT | `/api/v1/runs/{id}` | 러닝 기록 수정 | - |
| 8 | Run Service | DELETE | `/api/v1/runs/{id}` | 러닝 기록 삭제 | - |
| 9 | Dashboard | GET | `/api/v1/dashboard/summary` | 대시보드 요약 정보 | 이번 달 누적 거리/최근 기록 |
| 10 | Stat Service | GET | `/api/v1/stats/weekly` | 주간 러닝 거리 차트 | FastAPI 통계 전담 |
| 11 | Stat Service | GET | `/api/v1/stats/monthly` | 월별 누적 거리/페이스 차트 | FastAPI 통계 전담 |

---

## 2. 세부 API 스펙 예시

### 2.1 러닝 기록 등록 (`POST /api/v1/runs`)
* **Request Body (JSON)**:
```json
{
  "runDatetime": "2026-08-04T07:30:00",
  "durationSec": 1800,
  "distanceKm": 5.25,
  "avgHr": 145,
  "trainingTypeCode": "EASY",
  "rpe": 4,
  "weatherCode": "SUNNY",
  "memo": "아침 가벼운 조깅"
}
```
* **Response Body (JSON)**:
```json
{
  "code": 200,
  "message": "러닝 기록이 성공적으로 등록되었습니다.",
  "data": {
    "runRecordId": 1024,
    "distanceKm": 5.25,
    "avgPaceSec": 342
  }
}
```

### 2.2 대시보드 요약 (`GET /api/v1/dashboard/summary`)
* **Response Body (JSON)**:
```json
{
  "code": 200,
  "data": {
    "monthlyTotalDistanceKm": 42.8,
    "monthlyRunCount": 8,
    "monthlyAvgPaceSec": 335,
    "recentRuns": [
      {
        "runRecordId": 1024,
        "runDate": "2026-08-04",
        "distanceKm": 5.25,
        "durationSec": 1800,
        "trainingTypeName": "이지런"
      }
    ]
  }
}
```
