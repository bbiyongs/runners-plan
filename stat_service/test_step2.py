import os
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.garmin.client import GarminService
from app.garmin.parser import GarminDataParser

def main():
    email = os.getenv("GARMIN_EMAIL")
    password = os.getenv("GARMIN_PASSWORD")

    if not email or not password:
        print("[!] .env 파일에 가민 계정 정보가 없습니다.")
        return

    # 1. 기존 인증 클라이언트 로드 (1단계에서 저장된 세션 재사용)
    service = GarminService(email=email, password=password)
    client = service.get_client()

    print("[+] 최근 가민 활동 10개 조회 중...")
    # 2. 최근 10개 활동 조회 (0번부터 10개)
    raw_activities = client.get_activities(0, 10)
    print(f"[+] 총 {len(raw_activities)}개의 전체 활동을 가져왔습니다.")

    # 3. 러닝 활동만 파싱
    running_activities = GarminDataParser.parse_activities_list(raw_activities)
    print(f"[+] 그 중 러닝 기록: {len(running_activities)}개\n")

    # 4. 파싱된 러닝 데이터 출력
    for i, run in enumerate(running_activities, start=1):
        print(f"--- [러닝 기록 {i}] ---")
        print(f"ID       : {run.activity_id}")
        print(f"이름     : {run.name}")
        print(f"일시     : {run.start_time}")
        print(f"거리     : {run.distance_km} km")
        print(f"시간     : {run.duration_minutes} 분 ({run.duration_seconds}초)")
        print(f"평균페이스: {run.average_pace_str} ({run.average_pace_sec}초/km)")
        print(f"평균/최대심박: {run.average_hr} bpm / {run.max_hr} bpm")
        print(f"칼로리   : {run.calories} kcal\n")

if __name__ == "__main__":
    main()