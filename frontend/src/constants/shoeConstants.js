// src/constants/shoeConstants.js

// 브랜드 목록 옵션
export const SHOE_BRANDS = [
    { value: 'Nike', label: 'Nike' },
    { value: 'Asics', label: 'Asics' },
    { value: 'Hoka', label: 'Hoka' },
    { value: 'Adidas', label: 'Adidas' },
    { value: 'New Balance', label: 'New Balance' },
    { value: 'Saucony', label: 'Saucony' },
    { value: 'Mizuno', label: 'Mizuno' },
    { value: 'Brooks', label: 'Brooks' },
    { value: 'Puma', label: 'Puma' },
    { value: 'Other', label: '기타 브랜드' },
];

// 과거 러닝 거리 기반 착용 비중 옵션
export const USAGE_RATIO_OPTIONS = [
    { ratio: 0.7, label: '70% (메인 러닝화 - 기본)' },
    { ratio: 0.5, label: '50% (서브 러닝화)' },
    { ratio: 1.0, label: '100% (단독 착용)' },
    { ratio: 0.3, label: '30% (가끔 착용)' },
];

// 수명 상태 설정
export const SHOE_STATUS_CONFIG = {
    SAFE: {
        code: 'SAFE',
        label: '안전',
        badgeColor: '#2e7d32',
        badgeBg: '#e8f5e9',
        badgeBorder: '#c8e6c9',
        progressColor: '#10b981',
        warningBanner: false,
    },
    WARNING: {
        code: 'WARNING',
        label: '주의',
        badgeColor: '#d97706',
        badgeBg: '#fef3c7',
        badgeBorder: '#fde68a',
        progressColor: '#f59e0b',
        warningBanner: true,
        warningMessage: '쿠션 마모 주의: 교체를 고려하세요!',
    },
    DANGER: {
        code: 'DANGER',
        label: '수명 경고',
        badgeColor: '#dc2626',
        badgeBg: '#fee2e2',
        badgeBorder: '#fecaca',
        progressColor: '#ea580c',
        warningBanner: true,
        warningMessage: '쿠션 마모 주의: 교체를 권장합니다!',
    }
};

// 러닝화 수명 사용률 계산 및 상태 반환 헬퍼
export function getShoeStatusInfo(currentDistanceKm = 0, maxDistanceKm = 600) {
    const current = parseFloat(currentDistanceKm) || 0;
    const max = parseFloat(maxDistanceKm) || 600;
    const rate = max > 0 ? (current / max) * 100 : 0;
    const formattedRate = Math.min(Math.round(rate * 10) / 10, 100);
    const remainingKm = Math.max(0, Math.round((max - current) * 10) / 10);

    let statusKey = 'SAFE';
    if (rate >= 90) {
        statusKey = 'DANGER';
    } else if (rate >= 80) {
        statusKey = 'WARNING';
    }

    return {
        usageRatePct: formattedRate,
        remainingDistanceKm: remainingKm,
        statusConfig: SHOE_STATUS_CONFIG[statusKey],
    };
}
