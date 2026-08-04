# Running Coach (러닝 코치) 기술 스택 추천 및 보완 포인트 가이드 (v2.0 MVP)

**문서 작성일**: 2026년 8월 4일  
**작성자**: Running Coach 아키텍처 팀  
**버전**: v2.0 (1차 MVP 경량화 버전)  
**목적**: 프로젝트 1차 MVP (대시보드/러닝기록 등록·조회/통계분석)에 맞춘 기술 스택 및 보완 포인트 가이드  

---

## 1. 기술 스택 검토 요약 (v2.0)

| 분야 | 채택된 기술 스택 | 1차 MVP 적용 및 역할 |
| :--- | :--- | :--- |
| **Frontend** | React (JavaScript / TailwindCSS) | 대시보드 시각화, 러닝 기록 등록/조회 UI, 차트(Recharts/Chart.js) 렌더링 |
| **Core API Backend** | Spring Boot 3.x | 회원 관리, 소셜 인증(OAuth2/JWT), 러닝 기록 CRUD 전담 |
| **Stat & Analytics API** | **Python FastAPI + Pandas** | **(통계 전담 API)** 러닝 기록 주간/월간 집계 연산 및 차트 데이터 렌더링 |
| **Database** | **PostgreSQL 15+** | 1차 핵심 데이터(회원, 소셜계정, 러닝기록, 공통코드) 저장 및 인덱싱 |
| **SQL Mapper / ORM** | MyBatis / Spring Data JPA | 러닝 기록 조회 및 통계 쿼리 실행 |
| **Authentication** | Spring Security + JWT | RESTful 비상태성 인증 및 소셜 로그인(Google/Naver) |
| **DevOps** | Docker, Docker Compose | 로컬 및 개발 환경 컨테이너화 (Core + Stat + PostgreSQL + Redis) |

---

## 2. 1차 MVP 기술 스택 보완 포인트

### 2.1 Backend Dual Architecture: Spring Boot (Core) + Python FastAPI (Stat)
* **Spring Boot (Core API)**: 회원 가입, 소셜 로그인, 러닝 기록 등록/수정/삭제 등 안정적인 트랜잭션 처리.
* **Python FastAPI (Stat API)**: Pandas를 활용해 주간/월간 총 주행 거리, 평균 페이스, 일별 추이 데이터를 가공하여 프론트엔드 차트 라이브러리에 바로 전달.

### 2.2 Database 경량화 및 최적화 (PostgreSQL)
* 1차 범위에서 `GOAL`(목표) 및 `RACE_RECORD`(대회) 테이블을 제외하여 총 5개 핵심 테이블만 유지.
* `RUN_RECORD` 테이블에 `(runner_id, run_date)` 복합 인덱스를 적용하여 대시보드 및 목록 조회 속도 극대화.

---

## 3. 1차 MVP 아키텍처 구조

```
[ User Browser (React App) ]
            │
            ▼ (HTTPS / REST API)
   [ Nginx Reverse Proxy ]
            │
    ┌───────┴────────────────────────┐
    ▼                                ▼
[ Spring Boot Core API ]    [ Python FastAPI Stat API ]
(회원 / 기록 CRUD / 인증)    (주간/월간 통계 연산)
    │            │                   │
    ▼            ▼                   ▼
[ PostgreSQL ] [ Redis Cache ] [ FIT File Storage ]
```
