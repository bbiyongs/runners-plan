// DDL v3.0 WEATHER_TYPE 반영
export const WEATHER_MAP = {
    SUNNY: '맑음',
    CLOUDY: '흐림',
    RAIN: '비',
    SNOW: '눈'
};

// 요일 맵핑
export const WEEKDAY_MAP = {
    0: '일', 1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토'
};

// DDL v3.0 condition_score (1: 무거움, 2: 보통, 3: 상쾌함)
export const CONDITION_OPTIONS = [
    { value: 1, label: '1 - 무거움 😫' },
    { value: 2, label: '2 - 보통 🙂' },
    { value: 3, label: '3 - 상쾌함 🏃‍♂️' }
];

export const CONDITION_MAP = {
    1: '무거움',
    2: '보통',
    3: '상쾌함'
};

// DDL v3.0 PAIN_AREA 통증 부위
export const PAIN_AREA_MAP = {
    NONE: '통증 없음',
    KNEE_LEFT: '왼쪽 무릎',
    KNEE_RIGHT: '오른쪽 무릎',
    ANKLE: '발목',
    FOOT_SOLE: '발바닥(족저)',
    SHIN: '정강이(신스플린트)',
    ACHILLES: '아킬레스건',
    HIP_THIGH: '고관절/허벅지'
};

// DDL v3.0 pain_level 통증 강도 (0: 없음, 1: 뻐근함, 2: 불편함, 3: 심함)
export const PAIN_LEVEL_OPTIONS = [
    { value: 0, label: '0 - 없음 (정상)' },
    { value: 1, label: '1 - 뻐근함 (경미)' },
    { value: 2, label: '2 - 불편함 (주의)' },
    { value: 3, label: '3 - 심함 (휴식 필요)' }
];

export const PAIN_LEVEL_MAP = {
    0: '없음',
    1: '뻐근함',
    2: '불편함',
    3: '심함'
};

// DDL v3.0 RUNNING_LEVEL
export const RUNNING_LEVEL_MAP = {
    LV_CAT: '고양이 러너',
    LV_DEER: '사슴 러너',
    LV_WOLF: '늑대 러너',
    LV_CHEETAH: '치타 러너'
};

export const translateCondition = (score) => {
    return CONDITION_MAP[score] || '보통';
};

export const translatePainArea = (code) => {
    return PAIN_AREA_MAP[code] || code || '통증 없음';
};

export const translatePainLevel = (level) => {
    return PAIN_LEVEL_MAP[level] || '없음';
};

export const translateWeather = (code) => {
    return WEATHER_MAP[code] || code || '맑음';
};