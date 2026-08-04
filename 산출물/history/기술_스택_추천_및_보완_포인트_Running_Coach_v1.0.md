# Running Coach (러닝 코치) 기술 스택 추천 및 보완 포인트 가이드 (v1.0)

**문서 작성일**: 2026년 8월 3일  
**작성자**: Running Coach 아키텍처 팀  
**목적**: 프로젝트 기술 구성 검토 결과 정리, 보완 포인트 분석, 추천 아키텍처 및 단계별 진행 로드맵 제시  

---

## 1. 기술 스택 검토 요약

| 분야 | 채택된 기술 스택 | 검토 결과 및 핵심 적합성 |
| :--- | :--- | :--- |
| **Frontend** | React (JavaScript) | 대시보드 시각화 및 차트 렌더링에 적합한 SPA 표준 기술 |
| **Core API Backend** | Spring Boot 3.x | 핵심 비즈니스 로직, 회원/기록 CRUD, 보안 및 OAuth2/JWT 전담 |
| **Stat & Analytics API** | **Python FastAPI + Pandas** | **(통계 전담 API)** 러닝 통계 집계, PB 분석, FIT 파싱 및 AI 코칭 마이크로서비스 |
| **Database** | **PostgreSQL 12+** | **(강력 추천)** JSONB 데이터(FIT 파일 Raw data) 및 PostGIS(GPS 경로) 확장 지원 |
| **SQL Mapper** | MyBatis | 월별 통계, PB(개인 최고기록) 집계 등 복잡한 분석 쿼리 직접 튜닝 용이 |
| **Authentication**| Spring Security + JWT | RESTful 비상태성(Stateless) 인증 및 소셜 로그인(Google/Naver OAuth2) 연동 |
| **DevOps / CI** | Docker, Docker Compose, Jenkins | 컨테이너 기반 개발/테스트 및 CI 빌드/테스트 파이프라인 자동화 구축 |
| **Kubernetes** | **k3s (경량 K8s)** | **(학습용)** 단일 노드/개인 서버 환경에서 K8s 오케스트레이션 실습 최적 |
| **In-Memory (추천)**| **Redis** | JWT Refresh Token 저장, OAuth2 State 관리, 공통 코드 캐싱 용도 |
| **Batch (추천)** | **Spring Batch** | 일단위/월단위 집계 마트 생성(`RUN_STAT_DAILY`, `RUN_STAT_MONTHLY`) 자동화 |

---

## 2. 분야별 세부 검토 및 보완 가이드

### 2.1 Backend Dual Architecture: Spring Boot (Core) + Python FastAPI (Stat)
- **Spring Boot (Core API)**: 회원 관리, 소셜 인증, 러닝 기록 등록/수정/삭제, 대회 관리 등 핵심 트랜잭션 및 보안 처리 전담
- **Python FastAPI (Stat & Analytics API)**: 대용량 주행 데이터 통계 연산, 페이스/심박 상관분석 차트 생성, Garmin FIT 파일 파싱, AI 러닝 코칭 피드백 연동 전담 (빠른 개발속도 및 Pandas/NumPy 라이브러리 직접 활용)

### 2.2 Database: PostgreSQL 활용 극대화
- **JSONB 컬럼 활용 (V2 확장)**: Garmin FIT 파일이나 외부 기상 API에서 반환하는 비구조화 Raw payload를 PostgreSQL의 `JSONB` 컬럼에 직접 저장하여 스키마 변경 없이 가연성 있게 보관할 수 있습니다.
- **PostGIS 확장 모듈 (V3 확장)**: 러너의 GPS 위치 궤적 데이터를 단순 텍스트가 아닌 PostGIS `GEOMETRY(LineString, 4326)` 타입으로 관리하여, 경로 거리 계산 및 구간별 고도/속도 분석이 용이해집니다.

### 2.3 Frontend: TypeScript 전환 검토
- **보완 제언**: 초기 MVP는 React(JavaScript)로 빠르게 개발 가능하나, 백엔드 DTO와 프론트엔드 API 데이터 간 타입 불일치 버그를 예방하기 위해 **TypeScript** 도입을 강력 추천합니다.
- **차트 라이브러리 추천**: 대시보드 시각화를 위해 **Recharts** 또는 **Chart.js** 사용 추천.

---

## 3. 추천 아키텍처 구조

```
[ User Browser (React App) ]
            │
            ▼ (HTTPS / REST API)
   [ Nginx Ingress / Reverse Proxy ]
            │
    ┌───────┴────────────────────────┐
    ▼                                ▼
[ Spring Boot Core API ]    [ Python FastAPI Stat API ]
(회원/기록/인증/CRUD)         (통계집계/차트데이터/FIT분석)
    │            │                   │
    ▼            ▼                   ▼
[ PostgreSQL ] [ Redis Cache ] [ FIT File Storage ]
```

---

## 4. 차후 개발 진행 순서 (Next Steps Roadmap)

```
1단계: 문서 & 설계 산출물 최신화 (완료)
   ↓
2단계: Git 저장소 환경 세팅 & Initial Commit / Push (진행중)
   ↓
3단계: PostgreSQL DB 구축 & DDL/초기 데이터 검증
   ↓
4단계: Spring Boot Core API & Python FastAPI Stat API 프로젝트 세팅
   ↓
5단계: React 프론트엔드 구축 & 대시보드/차트 연동
   ↓
6단계: Docker Compose 통합 가동 & 종합 테스트 (Core + Stat + DB + Redis)
   ↓
7단계: CI/CD (Jenkins) 및 k3s 파이프라인 배포
```
