# Running Coach (러닝 코치) 테이블 명세서 (v3.0 - 슬로우 러닝 & 부상 방지 스펙)

**작성일**: 2026년 8월 21일  
**버전**: v3.0 (슬로우 러닝 & 부상 방지 헬스케어)  
**DBMS**: PostgreSQL 12+  

---

## 1. 주요 변경 테이블 명세: `RUN_RECORD` (러닝 기록)

* **개선 배경**: 기존 `rpe`(자각 운동강도), `training_type_code`(훈련유형)를 제거하고, 사용자가 3초 만에 탭할 수 있는 `condition_score`(컨디션), `pain_area_code`(통증 부위), `pain_level`(통증 강도)로 대체함.

| 컬럼명 (물리) | 컬럼명 (논리) | 데이터 타입 | PK/FK | Null | 기본값 | 설명 |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| `run_record_id` | 기록 ID | `BIGINT` | PK | X | Identity | 러닝 기록 고유 식별자 |
| `runner_id` | 러너 ID | `BIGINT` | FK | X | - | 등록한 러너 ID (`RUNNER`) |
| `shoe_id` | **러닝화 ID** | `BIGINT` | FK | O | - | **착용한 러닝화 ID (`RUNNING_SHOES`)** |
| `run_datetime` | 러닝 일시 | `TIMESTAMP` | - | X | - | 러닝 수행 날짜 및 시간 |
| `run_date` | 러닝 일자 | `DATE` | - | X | - | 필터용 날짜 (`YYYY-MM-DD`) |
| `duration_sec` | 주행 시간 | `INTEGER` | - | X | - | 총 주행 시간 (초) |
| `distance_km` | 주행 거리 | `NUMERIC(6,2)` | - | X | - | 주행 거리 (km) |
| `avg_pace_sec` | 평균 페이스 | `INTEGER` | - | O | - | km당 평균 페이스 (초) |
| `avg_hr` | 평균 심박수 | `INTEGER` | - | O | - | 평균 심박수 (BPM) |
| `max_hr` | **최대 심박수** | `INTEGER` | - | O | - | **주행 중 최고/최대 심박수 (BPM)** |
| `condition_score`| **체력 컨디션** | `INTEGER` | - | X | `2` | **1: 무거움, 2: 보통, 3: 상쾌함** |
| `pain_area_code` | **통증 부위** | `VARCHAR(30)` | - | X | `'NONE'` | **NONE, KNEE_LEFT, ANKLE, FOOT_SOLE 등** |
| `pain_level` | **통증 강도** | `INTEGER` | - | X | `0` | **0: 없음, 1: 뻐근함, 2: 불편함, 3: 심함** |
| `temperature` | 기온 | `NUMERIC(4,1)` | - | O | - | 섭씨 기온 |
| `humidity` | 습도 | `INTEGER` | - | O | - | 습도 (%) |
| `weather_code` | 날씨 코드 | `VARCHAR(30)` | - | O | - | SUNNY, CLOUDY, RAIN 등 |
| `memo` | 메모 | `VARCHAR(1000)` | - | O | - | 러닝 회고 메모 |
| `created_at` | 생성 일시 | `TIMESTAMP` | - | X | `CURRENT_TIMESTAMP` | 등록 일시 |

---

## 2. 공통 코드 변경: `PAIN_AREA` (통증 부위 그룹)

| 코드값 | 코드명 (한글) | 설명 |
| :--- | :--- | :--- |
| `NONE` | 없음 | 통증 및 이상 없음 (정상) |
| `KNEE_LEFT` | 왼쪽 무릎 | 왼쪽 슬관절 부근 통증 및 뻐근함 |
| `KNEE_RIGHT` | 오른쪽 무릎 | 오른쪽 슬관절 부근 통증 및 뻐근함 |
| `ANKLE` | 발목 | 발목 관절 부근 통증 |
| `FOOT_SOLE` | 발바닥(족저) | 족저근막 부위 통증 |
| `SHIN` | 정강이(신스플린트) | 정강이 뼈 부위 통증 |
| `ACHILLES` | 아킬레스건 | 아킬레스건 부위 통증 |
| `HIP_THIGH` | 고관절/허벅지 | 고관절 및 햄스트링/대퇴사두 통증 |
