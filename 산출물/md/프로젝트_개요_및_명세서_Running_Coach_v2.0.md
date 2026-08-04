# Running Coach (러닝 코치) 프로젝트 개요 및 명세서 (v2.0 MVP)

**문서 작성일**: 2026년 8월 4일  
**작성자**: Running Coach 서비스 개발팀  
**버전**: v2.0 (1차 MVP 경량화 버전)  

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적
* 러너가 일상적인 러닝 기록을 간편하게 등록하고, 주간/월간 러닝 성과를 대시보드와 차트로 직관적으로 시각화하여 지속적인 러닝 동기를 부여하는 웹 서비스 구축.
* 단기 개발 기간을 고려하여 핵심 기능(대시보드, 기록 등록, 목록 조회, 통계 분석)에 집중하고, 목표 관리 및 대회 기록 관리는 2차 고도화 범위로 보류함.

### 1.2 핵심 기능 범주 (1차 MVP)
1. **대시보드 (Dashboard)**: 이번 달 누적 거리, 최근 러닝 기록, 주간 요약 그래프.
2. **러닝 기록 등록/수정/삭제 (Log Entry)**: 주행 일시, 거리, 시간, 페이스, 심박수, 강도(RPE), 메모 등록.
3. **러닝 기록 목록 조회 (Log History)**: 월별/기간별 러닝 기록 페이징 목록 및 상세 조회.
4. **통계 분석 (Analytics & Stats)**: 월별 누적 거리/시간 추이 차트, 평균 페이스 분석 (FastAPI 연동).
5. **회원 인증 (Auth)**: 소셜 로그인(Google/Naver OAuth2) 및 JWT 기반 비상태성 인증.

---

## 2. 시스템 구성 및 아키텍처

```
[ User Browser (React App) ]
            │
            ▼ (REST API / JSON)
   [ Nginx Reverse Proxy ]
            │
    ┌───────┴────────────────────────┐
    ▼                                ▼
[ Spring Boot Core API ]    [ Python FastAPI Stat API ]
(회원/기록 CRUD/인증)          (통계집계/차트데이터)
    │            │                   │
    ▼            ▼                   ▼
[ PostgreSQL ] [ Redis Cache ] [ FIT File Storage ]
```

---

## 3. 백엔드 API 명세 요약 (v2.0)

| 순번 | 분류 | HTTP Method | API Endpoints | 설명 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **인증** | POST | `/api/v1/auth/login` | 소셜 OAuth2 로그인 및 JWT 발급 |
| 2 | **인증** | POST | `/api/v1/auth/refresh` | Access Token 재발급 |
| 3 | **러너** | GET | `/api/v1/users/me` | 내 프로필 정보 조회 |
| 4 | **기록** | POST | `/api/v1/runs` | 새로운 러닝 기록 등록 |
| 5 | **기록** | GET | `/api/v1/runs` | 러닝 기록 목록 조회 (페이징, 월별 필터) |
| 6 | **기록** | GET | `/api/v1/runs/{id}` | 러닝 기록 상세 조회 |
| 7 | **기록** | PUT | `/api/v1/runs/{id}` | 러닝 기록 수정 |
| 8 | **기록** | DELETE | `/api/v1/runs/{id}` | 러닝 기록 삭제 |
| 9 | **대시보드**| GET | `/api/v1/dashboard/summary` | 이번 달 누적/최근 기록 대시보드 요약 |
| 10 | **통계** | GET | `/api/v1/stats/weekly` | 주간 러닝 거리 차트 데이터 |
| 11 | **통계** | GET | `/api/v1/stats/monthly` | 월별 누적 거리 및 페이스 추이 차트 |

---

## 4. 데이터베이스 테이블 명세 (PostgreSQL v2.0)

1. `CODE_GROUP` : 공통 코드 그룹 (훈련 유형, 날씨 등)
2. `CODE_DETAIL` : 공통 코드 상세 (EASY, LSD, TEMPO 등)
3. `RUNNER` : 러너 회원 기본 정보
4. `RUNNER_SOCIAL_ACCOUNT` : 소셜 계정 연동 정보
5. `RUN_RECORD` : 러닝 상세 기록 (주행 거리, 시간, 페이스, 심박, RPE, 메모)

---

## 5. 2차 고도화 예정 항목 (Backlog)
* **목표 관리 (Goal Management)**: 주간/월간 목표 거리 설정 및 달성률 알림.
* **대회 기록 관리 (Race Record)**: 공식 마라톤 대회 참가 이력 및 완주증 보관.
* **Garmin FIT 파일 파싱**: 핏 파일 자동 업로드 및 GPS 경로 지도 시각화.
