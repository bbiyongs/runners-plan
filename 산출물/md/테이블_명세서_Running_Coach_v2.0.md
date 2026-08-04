# Running Coach (러닝 코치) 테이블 명세서 (v2.0 MVP)

**문서 작성일**: 2026년 8월 4일  
**버전**: v2.0 (1차 MVP 경량화 버전)  
**대상 DBMS**: PostgreSQL 12+  

---

## 1. 테이블 목록 요약

| 순번 | 논리 테이블명 | 물리 테이블명 | 설명 | 비고 |
| :---: | :--- | :--- | :--- | :--- |
| 1 | 공통 코드 그룹 | `CODE_GROUP` | 공통 코드 그룹 정보 | 필수 |
| 2 | 공통 코드 상세 | `CODE_DETAIL` | 공통 코드 상세 매핑 데이터 | 필수 |
| 3 | 러너 기본 정보 | `RUNNER` | 러너 회원 정보 | 필수 |
| 4 | 소셜 계정 정보 | `RUNNER_SOCIAL_ACCOUNT` | OAuth2 소셜 로그인 매핑 | 필수 |
| 5 | 러닝 기록 | `RUN_RECORD` | 일상 러닝 기록 세부 데이터 | 필수 (핵심) |

---

## 2. 테이블 세부 명세

### 2.1 `CODE_GROUP` (공통 코드 그룹)
* **설명**: 시스템 공통 코드 그룹 분류

| 컬럼명 (물리) | 컬럼명 (논리) | 데이터 타입 | PK | Null 허용 | 기본값 | 설명 |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `group_code` | 그룹 코드 | `VARCHAR(30)` | O | X | - | 코드 그룹 식별자 (예: TRAINING_TYPE) |
| `group_name` | 그룹명 | `VARCHAR(100)` | - | X | - | 그룹 한글명 |
| `description` | 설명 | `VARCHAR(500)` | - | O | - | 코드 그룹 상세 설명 |
| `use_yn` | 사용 여부 | `CHAR(1)` | - | X | `'Y'` | Y / N |
| `created_at` | 생성 일시 | `TIMESTAMP` | - | X | `CURRENT_TIMESTAMP` | 최초 생성 일시 |
| `updated_at` | 수정 일시 | `TIMESTAMP` | - | O | - | 최종 수정 일시 |

---

### 2.2 `CODE_DETAIL` (공통 코드 상세)
* **설명**: 시스템 공통 코드 상세 값

| 컬럼명 (물리) | 컬럼명 (논리) | 데이터 타입 | PK | FK | Null 허용 | 기본값 | 설명 |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `code_id` | 코드 ID | `BIGINT` | O | - | X | Auto Identity | 상세 코드 고유 ID |
| `group_code` | 그룹 코드 | `VARCHAR(30)` | - | O (`CODE_GROUP`) | X | - | 부모 코드 그룹 |
| `code_value` | 코드 값 | `VARCHAR(30)` | - | - | X | - | 코드 고유 값 (예: EASY, LSD) |
| `code_name` | 코드 명 | `VARCHAR(100)` | - | - | X | - | 코드 한글명 (예: 이지런, LSD) |
| `sort_order` | 정렬 순서 | `INTEGER` | - | - | O | - | 화면 표시 정렬 순서 |
| `use_yn` | 사용 여부 | `CHAR(1)` | - | - | X | `'Y'` | Y / N |
| `created_at` | 생성 일시 | `TIMESTAMP` | - | - | X | `CURRENT_TIMESTAMP` | 생성 일시 |

---

### 2.3 `RUNNER` (러너 기본 정보)
* **설명**: 러닝 코치 회원 정보

| 컬럼명 (물리) | 컬럼명 (논리) | 데이터 타입 | PK | Null 허용 | 기본값 | 설명 |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `runner_id` | 러너 ID | `BIGINT` | O | X | Auto Identity | 러너 고유 식별자 |
| `nickname` | 닉네임 | `VARCHAR(50)` | - | O | - | 사용자 닉네임 |
| `profile_image_url` | 프로필 이미지 URL | `VARCHAR(500)` | - | O | - | 소셜 프로필 이미지 경로 |
| `created_at` | 가입 일시 | `TIMESTAMP` | - | X | `CURRENT_TIMESTAMP` | 회원 가입 일시 |
| `updated_at` | 수정 일시 | `TIMESTAMP` | - | O | - | 정보 수정 일시 |

---

### 2.4 `RUNNER_SOCIAL_ACCOUNT` (소셜 계정 정보)
* **설명**: OAuth2 소셜 연동 계정 정보

| 컬럼명 (물리) | 컬럼명 (논리) | 데이터 타입 | PK | FK | Null 허용 | 기본값 | 설명 |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `social_account_id` | 소셜 계정 ID | `BIGINT` | O | - | X | Auto Identity | 소셜 계정 고유 ID |
| `runner_id` | 러너 ID | `BIGINT` | - | O (`RUNNER`) | X | - | 소유 러너 ID |
| `provider` | 제공자 | `VARCHAR(20)` | - | - | X | - | GOOGLE, NAVER 등 |
| `provider_user_id` | 제공자 유저 ID | `VARCHAR(100)` | - | - | X | - | 소셜 제공자 고유 식별자 |
| `provider_email` | 소셜 이메일 | `VARCHAR(200)` | - | - | O | - | 소셜 계정 이메일 |
| `is_primary` | 대표 계정 여부 | `CHAR(1)` | - | - | X | `'N'` | Y / N |
| `connected_at` | 연동 일시 | `TIMESTAMP` | - | - | X | `CURRENT_TIMESTAMP` | 최초 연동 일시 |

---

### 2.5 `RUN_RECORD` (러닝 기록)
* **설명**: 일상 러닝 수행 세부 기록

| 컬럼명 (물리) | 컬럼명 (논리) | 데이터 타입 | PK | FK | Null 허용 | 기본값 | 설명 |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `run_record_id` | 기록 ID | `BIGINT` | O | - | X | Auto Identity | 러닝 기록 고유 ID |
| `runner_id` | 러너 ID | `BIGINT` | - | O (`RUNNER`) | X | - | 등록한 러너 ID |
| `run_datetime` | 러닝 일시 | `TIMESTAMP` | - | - | X | - | 러닝 수행 날짜 및 시간 |
| `run_date` | 러닝 일자 | `DATE` | - | - | X | - | 필터용 날짜 (`YYYY-MM-DD`) |
| `duration_sec` | 주행 시간 | `INTEGER` | - | - | X | - | 총 주행 시간 (초) |
| `distance_km` | 주행 거리 | `NUMERIC(6,2)` | - | - | X | - | 주행 거리 (km) |
| `avg_pace_sec` | 평균 페이스 | `INTEGER` | - | - | O | - | km당 평균 페이스 (초) |
| `avg_hr` | 평균 심박수 | `INTEGER` | - | - | O | - | 평균 심박수 (BPM) |
| `training_type_code`| 훈련 유형 코드 | `VARCHAR(30)` | - | - | X | - | EASY, LSD, TEMPO 등 |
| `rpe` | 운동 강도 | `INTEGER` | - | - | O | - | 자각적 운동 강도 (1~10) |
| `temperature` | 기온 | `NUMERIC(4,1)` | - | - | O | - | 섭씨 온도 |
| `humidity` | 습도 | `INTEGER` | - | - | O | - | 습도 (%) |
| `weather_code` | 날씨 코드 | `VARCHAR(30)` | - | - | O | - | SUNNY, CLOUDY, RAIN 등 |
| `memo` | 메모 | `VARCHAR(1000)` | - | - | O | - | 러닝 메모 |
| `created_at` | 생성 일시 | `TIMESTAMP` | - | - | X | `CURRENT_TIMESTAMP` | 등록 일시 |
