import logging
import requests

logger = logging.getLogger(__name__)

class WeatherFetcher:
    """Open-Meteo 1회 배치 날씨 수집 전담 모듈"""

    @staticmethod
    def fetch_batch_map(start_date_str: str, end_date_str: str, lat: float = 37.5665, lon: float = 126.9780) -> dict:
        weather_map = {}
        try:
            url = (
                f"https://archive-api.open-meteo.com/v1/archive?"
                f"latitude={lat}&longitude={lon}&start_date={start_date_str}&end_date={end_date_str}"
                f"&hourly=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FTokyo"
            )
            res = requests.get(url, timeout=8)
            
            if res.status_code != 200:
                url = (
                    f"https://api.open-meteo.com/v1/forecast?"
                    f"latitude={lat}&longitude={lon}&start_date={start_date_str}&end_date={end_date_str}"
                    f"&hourly=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia%2FTokyo"
                )
                res = requests.get(url, timeout=8)

            if res.status_code == 200:
                data = res.json()
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])
                temps = hourly.get("temperature_2m", [])
                hums = hourly.get("relative_humidity_2m", [])
                w_codes = hourly.get("weather_code", [])

                for idx, t_str in enumerate(times):
                    key = t_str.replace("T", " ")[:13] # "YYYY-MM-DD HH"
                    wmo_code = w_codes[idx] if idx < len(w_codes) else 0

                    weather_code = "SUNNY"
                    if wmo_code in [2, 3, 45, 48]:
                        weather_code = "CLOUDY"
                    elif wmo_code in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95]:
                        weather_code = "RAIN"
                    elif wmo_code in [71, 73, 75, 77, 85, 86]:
                        weather_code = "SNOW"

                    temp = temps[idx] if idx < len(temps) else None
                    hum = hums[idx] if idx < len(hums) else None

                    weather_map[key] = (temp, hum, weather_code)
        except Exception as e:
            logger.warning(f"Open-Meteo 날씨 배치 수집 스킵: {e}")

        return weather_map