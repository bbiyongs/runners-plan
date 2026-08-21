// src/components/shoes/ShoeCard.jsx
import React from 'react';
import { getShoeStatusInfo } from '@/constants/shoeConstants';
import { AlertTriangle, CheckCircle, Award } from 'lucide-react';

export default function ShoeCard({ shoe, onSetDefault, onEdit, onRetire }) {
    const {
        shoeId,
        shoeName,
        brand,
        purchasedDate,
        currentDistanceKm = 0,
        maxDistanceKm = 600,
        isDefault,
        isRetired
    } = shoe;

    const { usageRatePct, remainingDistanceKm, statusConfig } = getShoeStatusInfo(currentDistanceKm, maxDistanceKm);

    return (
        <div className={`shoe-card ${isDefault ? 'is-default-card' : ''} ${isRetired ? 'is-retired-card' : ''}`}>
            {/* 카드 상단 배지 영역 */}
            <div className="shoe-card-header">
                <div className="shoe-badge-group">
                    {isDefault && (
                        <span className="badge-default-shoe">
                            [대표 러닝화]
                        </span>
                    )}
                    <span
                        className="badge-shoe-status"
                        style={{
                            color: statusConfig.badgeColor,
                            backgroundColor: statusConfig.badgeBg,
                            borderColor: statusConfig.badgeBorder
                        }}
                    >
                        [{statusConfig.label}]
                    </span>
                    {isRetired && <span className="badge-retired">[은퇴]</span>}
                </div>
            </div>

            {/* 모델명 & 메타 정보 */}
            <div className="shoe-info-section">
                <h3 className="shoe-name">{shoeName}</h3>
                <div className="shoe-meta">
                    <span>브랜드: <strong>{brand || '기타'}</strong></span>
                    {purchasedDate && <span>구매: <strong>{purchasedDate}</strong></span>}
                </div>
            </div>

            {/* 프로그레스 바 영역 */}
            <div className="shoe-progress-section">
                <div className="shoe-progress-track">
                    <div
                        className="shoe-progress-bar"
                        style={{
                            width: `${Math.min(usageRatePct, 100)}%`,
                            backgroundColor: statusConfig.progressColor
                        }}
                    />
                </div>
                <div className="shoe-distance-info">
                    <span className="current-max">
                        <strong>{currentDistanceKm} km</strong> / {maxDistanceKm} km ({usageRatePct}%)
                    </span>
                    <span className="remaining">
                        남은 거리: <strong>{remainingDistanceKm} km</strong>
                    </span>
                </div>
            </div>

            {/* 수명 경고 배너 (80% 이상 주의 / 90% 이상 위험) */}
            {statusConfig.warningBanner && !isRetired && (
                <div className="shoe-warning-banner">
                    <AlertTriangle size={15} color="#d97706" />
                    <span>{statusConfig.warningMessage}</span>
                </div>
            )}

            {/* 하단 액션 버튼 그룹 */}
            <div className="shoe-card-actions">
                {!isDefault && !isRetired && (
                    <button
                        type="button"
                        className="btn-shoe-default"
                        onClick={() => onSetDefault(shoeId)}
                    >
                        대표 설정
                    </button>
                )}
                {!isRetired && (
                    <button
                        type="button"
                        className="btn-shoe-edit"
                        onClick={() => onEdit(shoe)}
                    >
                        수정
                    </button>
                )}
                {!isRetired && (
                    <button
                        type="button"
                        className="btn-shoe-retire"
                        onClick={() => onRetire(shoeId)}
                    >
                        은퇴
                    </button>
                )}
            </div>
        </div>
    );
}
