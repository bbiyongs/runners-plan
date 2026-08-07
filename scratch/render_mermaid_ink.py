import urllib.request
import json
import base64

mermaid_code = """
erDiagram
    RUNNER {
        bigint runner_id PK
        varchar nickname
        varchar profile_image_url
        timestamp created_at
        timestamp updated_at
    }

    RUNNER_SOCIAL_ACCOUNT {
        bigint social_account_id PK
        bigint runner_id FK
        varchar provider
        varchar provider_user_id
        varchar provider_email
        char is_primary
        timestamp connected_at
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }

    RUN_RECORD {
        bigint run_record_id PK
        bigint runner_id FK
        timestamp run_datetime
        date run_date
        integer duration_sec
        numeric distance_km
        integer avg_pace_sec
        integer avg_hr
        varchar training_type_code
        integer rpe
        numeric temperature
        integer humidity
        varchar weather_code
        varchar memo
        timestamp created_at
        timestamp updated_at
    }

    GARMIN_RUN_DETAIL {
        bigint garmin_detail_id PK
        bigint run_record_id FK
        bigint garmin_activity_id UQ
        integer max_hr
        integer avg_cadence
        integer max_cadence
        integer avg_stride_length_mm
        numeric elevation_gain_m
        numeric elevation_loss_m
        numeric vo2_max
        numeric training_effect_aerobic
        numeric training_effect_anaerobic
        integer calories
        jsonb gpx_route_json
        timestamp created_at
        timestamp updated_at
    }

    GARMIN_RUN_LAP {
        bigint lap_id PK
        bigint run_record_id FK
        integer lap_index
        numeric lap_distance_km
        integer lap_duration_sec
        integer lap_avg_pace_sec
        integer lap_avg_hr
        integer lap_max_hr
        integer lap_avg_cadence
        timestamp created_at
    }

    CODE_GROUP {
        varchar group_code PK
        varchar group_name
        varchar description
        char use_yn
        timestamp created_at
        timestamp updated_at
    }

    CODE_DETAIL {
        bigint code_id PK
        varchar group_code FK
        varchar code_value
        varchar code_name
        varchar description
        integer sort_order
        char use_yn
        timestamp created_at
        timestamp updated_at
    }

    RUNNER ||--o{ RUNNER_SOCIAL_ACCOUNT : "1:N"
    RUNNER ||--o{ RUN_RECORD : "1:N"
    RUN_RECORD ||--o| GARMIN_RUN_DETAIL : "1:1"
    RUN_RECORD ||--o{ GARMIN_RUN_LAP : "1:N"
    CODE_GROUP ||--o{ CODE_DETAIL : "1:N"
"""

# mermaid.ink URL encoding
graph_bytes = mermaid_code.encode('utf-8')
base64_bytes = base64.b64encode(graph_bytes)
base64_string = base64_bytes.decode('ascii')

url = f"https://mermaid.ink/img/{base64_string}?bgColor=1e1e1e"

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        with open("c:/Runners_plan/ERD_VER_2_0.png", "wb") as f:
            f.write(response.read())
    print("Successfully generated ERD_VER_2_0.png via mermaid.ink!")
except Exception as e:
    print("Error:", e)
