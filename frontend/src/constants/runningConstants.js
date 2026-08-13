// src/constants/runningConstants.js

// 훈련 유형 맵핑 (코드 ➔ 한글 명칭)
export const TRAINING_TYPE_MAP = {
    EASY: '조깅',
    TEMPO: '템포런',
    INTERVAL: '인터벌',
    LSD: 'LSD',
    RECOVERY: '회복런',
    RACE: '대회'
};

// 날씨 맵핑 (코드 ➔ 한글 명칭)
export const WEATHER_MAP = {
    SUNNY: '맑음',
    CLOUDY: '흐림',
    RAINY: '비',
    SNOWY: '눈',
    WINDY: '바람'
};

// 요일 맵핑 (숫자 ➔ 한글 요일)
export const WEEKDAY_MAP = {
    0: '월',
    1: '화',
    2: '수',
    3: '목',
    4: '금',
    5: '토',
    6: '일'
};

export const RPE_OPTIONS = [
    { value: '1', label: '1 - 매우 쉬움 (가벼운 산책)' },
    { value: '2', label: '2 - 매우 쉬움 (회복 조깅)' },
    { value: '3', label: '3 - 쉬움 (편안한 조깅)' },
    { value: '4', label: '4 - 보통 (지구력 조깅)' },
    { value: '5', label: '5 - 약간 힘듦 (템포런)' },
    { value: '6', label: '6 - 약간 힘듦 (빌드업)' },
    { value: '7', label: '7 - 힘듦 (고강도 러닝)' },
    { value: '8', label: '8 - 힘듦 (인터벌)' },
    { value: '9', label: '9 - 매우 힘듦 (최대 한계)' },
    { value: '10', label: '10 - 올아웃 (대회 전력질주)' }
];

// 훈련 유형 헬퍼 함수
export const translateTrainingType = (code) => {
    return TRAINING_TYPE_MAP[code] || code || '조깅';
};

// 날씨 헬퍼 함수
export const translateWeather = (code) => {
    return WEATHER_MAP[code] || code || '맑음';
};