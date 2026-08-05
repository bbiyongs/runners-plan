// 초를 x시간y분z초 / y분z초 로 변환
export function formatDuration(durationSec) {
    if(!durationSec) return '-';
    const hours = Math.floor(durationSec/3600);
    const minutes = Math.floor((durationSec %3600) /60 );
    const seconds = durationSec % 60;

    if (hours > 0) {
        return `${hours}시간 ${minutes}분 ${seconds}초`;
    }

    return `${minutes}분 ${seconds}초`;
}

export function getRpeLabel(rpe) {
    if(!rpe) return '-';
    const label = {
        1: '1 (매우 쉬움)',
        2: '2 (쉬움)',
        3: '3 (보통)',
        4: '4 (약간 힘듦)',
        5: '5 (힘듦)',
        6: '6 (힘듦+)',
        7: '7 (매우 힘듦)',
        8: '8 (매우 힘듦+)',
        9: '9 (최고 힘듦)',
        10: '10 (한계 도달)',
    }; 

    return label[rpe] || `${rpe}`;
}