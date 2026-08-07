import urllib.request
import json

mermaid_code = """
erDiagram
    RUNNER {
        bigint runner_id PK "러너ID"
        varchar nickname "닉네임"
        varchar profile_image_url "프로필이미지"
        timestamp created_at "생성일시"
        timestamp updated_at "수정일시"
    }

    RUNNER_SOCIAL_ACCOUNT {
        bigint social_account_id PK "소셜계정ID"
        bigint runner_id FK "러너ID"
        varchar provider "제공자"
        varchar provider_user_id "제공자사용자ID"
        varchar provider_email "소셜이메일"
        char is_primary "대표여부"
        timestamp connected_at "연동일시"
        timestamp last_login_at "최종로그인일시"
        timestamp created_at "생성일시"
        timestamp updated_at "수정일시"
    }

    RUN_RECORD {
        bigint run_record_id PK "러닝기록ID"
        bigint runner_id FK "러너ID"
        timestamp run_datetime "운동일시"
        date run_date "운동일자"
        integer duration_sec "운동시간(초)"
        numeric distance_km "거리(km)"
        integer avg_pace_sec "평균페이스(초)"
        integer avg_hr "평균심박수"
        varchar training_type_code "훈련유형코드"
        integer rpe "운동강도"
        numeric temperature "온도"
        integer humidity "습도"
        varchar weather_code "날씨코드"
        varchar memo "메모"
        timestamp created_at "생성일시"
        timestamp updated_at "수정일시"
    }

    GARMIN_RUN_DETAIL {
        bigint garmin_detail_id PK "가민상세ID"
        bigint run_record_id FK "러닝기록ID (UQ)"
        bigint garmin_activity_id "가민활동ID (UQ)"
        integer max_hr "최대심박수"
        integer avg_cadence "평균케이던스"
        integer max_cadence "최대케이던스"
        integer avg_stride_length_mm "평균보폭(mm)"
        numeric elevation_gain_m "획득고도(m)"
        numeric elevation_loss_m "손실고도(m)"
        numeric vo2_max "추정VO2Max"
        numeric training_effect_aerobic "유산소훈련효과"
        numeric training_effect_anaerobic "무산소훈련효과"
        integer calories "소모칼로리"
        jsonb gpx_route_json "GPS경로JSON"
        timestamp created_at "생성일시"
        timestamp updated_at "수정일시"
    }

    GARMIN_RUN_LAP {
        bigint lap_id PK "랩ID"
        bigint run_record_id FK "러닝기록ID"
        integer lap_index "구간순번"
        numeric lap_distance_km "구간거리(km)"
        integer lap_duration_sec "구간소요시간(초)"
        integer lap_avg_pace_sec "구간평균페이스(초)"
        integer lap_avg_hr "구간평균심박수"
        integer lap_max_hr "구간최대심박수"
        integer lap_avg_cadence "구간케이던스"
        timestamp created_at "생성일시"
    }

    CODE_GROUP {
        varchar group_code PK "그룹코드"
        varchar group_name "그룹명"
        varchar description "설명"
        char use_yn "사용여부"
        timestamp created_at "생성일시"
        timestamp updated_at "수정일시"
    }

    CODE_DETAIL {
        bigint code_id PK "코드ID"
        varchar group_code FK "그룹코드"
        varchar code_value "코드값"
        varchar code_name "코드명"
        varchar description "설명"
        integer sort_order "정렬순서"
        char use_yn "사용여부"
        timestamp created_at "생성일시"
        timestamp updated_at "수정일시"
    }

    RUNNER ||--o{ RUNNER_SOCIAL_ACCOUNT : "1:N"
    RUNNER ||--o{ RUN_RECORD : "1:N"
    RUN_RECORD ||--o| GARMIN_RUN_DETAIL : "1:1"
    RUN_RECORD ||--o{ GARMIN_RUN_LAP : "1:N"
    CODE_GROUP ||--o{ CODE_DETAIL : "1:N"
"""

url = "https://kroki.io/mermaid/png"
req = urllib.request.Request(url, data=mermaid_code.encode('utf-8'), headers={'Content-Type': 'text/plain; charset=utf-8'})

try:
    with urllib.request.urlopen(req) as response:
        with open("c:/Runners_plan/ERD_VER_2_0.png", "wb") as f:
            f.write(response.read())
    print("Vector ERD PNG generated perfectly at c:/Runners_plan/ERD_VER_2_0.png")
except Exception as e:
    print("Error generating ERD:", e)
