# Running Coach (러닝 코치) 인덱스 설계서 (v2.0 MVP)

**문서 작성일**: 2026년 8월 4일  
**버전**: v2.0 (1차 MVP 경량화 버전)  
**대상 DBMS**: PostgreSQL 12+  

---

## 1. 인덱스 설계 개요
1차 MVP 범위인 **대시보드 빠른 조회, 러닝 기록 월별 목록 필터링, 통계 분석 쿼리**의 속도를 최적화하기 위한 인덱스 설계입니다.

---

## 2. 인덱스 정의 목록

| 순번 | 대상 테이블 | 인덱스 물리명 | 인덱스 유형 | 구성 컬럼 | 설계 목적 |
| :---: | :--- | :--- | :---: | :--- | :--- |
| 1 | `RUNNER_SOCIAL_ACCOUNT` | `UIDX_RUNNER_SOCIAL_ACCOUNT_01` | Unique | `provider, provider_user_id` | 소셜 로그인 계정 고유성 보장 및 로그인 속도 최적화 |
| 2 | `RUNNER_SOCIAL_ACCOUNT` | `IDX_RUNNER_SOCIAL_ACCOUNT_01` | Non-Unique | `runner_id` | 러너 회원 기본 조인 성능 향상 |
| 3 | `RUN_RECORD` | `IDX_RUN_RECORD_01` | Non-Unique | `runner_id, run_date` | **(핵심)** 러너별 특정 날짜/월별 러닝 목록 필터링 조회 최적화 |
| 4 | `RUN_RECORD` | `IDX_RUN_RECORD_02` | Non-Unique | `runner_id, training_type_code` | 러너별 훈련 유형(EASY, LSD 등) 조회 성능 개선 |
| 5 | `RUN_RECORD` | `IDX_RUN_RECORD_03` | Non-Unique | `run_date` | 전체 일자별 통계 집계 쿼리속도 개선 |
| 6 | `RUN_RECORD` | `IDX_RUN_RECORD_04` | Non-Unique | `runner_id, run_datetime` | 대시보드 최근 러닝 기록 Top N 조회 최적화 |
| 7 | `CODE_DETAIL` | `UIDX_CODE_DETAIL_01` | Unique | `group_code, code_value` | 코드 그룹 내 코드 값 고유성 확보 및 캐싱 검색 |
| 8 | `CODE_DETAIL` | `IDX_CODE_DETAIL_02` | Non-Unique | `group_code` | 그룹별 공통 코드 목록 조회 속도 개선 |
