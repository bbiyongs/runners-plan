// 초를 x시간y분z초 / y분z초 로 변환
export function formatDuration(durationSec) {
    if (durationSec == null) return '-';
    const hours = Math.floor(durationSec / 3600);
    const minutes = Math.floor((durationSec % 3600) / 60);
    const seconds = durationSec % 60;

    if (hours > 0) {
        return `${hours}시간 ${minutes}분 ${seconds}초`;
    }

    return `${minutes}분 ${seconds}초`;
}

// [수정 코드]
export function getConditionLabel(score) {
    const map = {
        1: '무거움 (1점)',
        2: '보통 (2점)',
        3: '상쾌함 (3점)'
    };
    return map[score] || '보통 (2점)';
}

export function getPainLevelLabel(level) {
    const map = {
        0: '0 - 없음 (정상)',
        1: '1 - 뻐근함',
        2: '2 - 불편함',
        3: '3 - 심함'
    };
    return map[level] || '0 - 없음';
}