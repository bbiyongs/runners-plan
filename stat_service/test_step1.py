import os
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.garmin.client import GarminService

def main():
    email = os.getenv("GARMIN_EMAIL")
    password = os.getenv("GARMIN_PASSWORD")

    if not email or not password:
        print("[!] .env 파일에 email password 입력")
        return

    print(f"Garmin 인증 시도 : {email}")
    service = GarminService(email=email, password=password)
    client = service.get_client()

    profile =  client.get_user_profile()
    print(f"[OK] 로그인 성공! 닉네임: {profile.get('userName')}")
    print(f"[OK] 세션 토큰 저장 위치: {service.token_dir}")

if __name__ == "__main__":
    main()