// src/components/shoes/ShoeLifeCard.jsx
import React, { useState, useEffect } from 'react';
import { shoeApi } from '@/api/shoeApi';
import { getShoeStatusInfo } from '@/constants/shoeConstants';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ShoeLifeCard() {
    const navigate = useNavigate();
    const [mainShoe, setMainShoe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        shoeApi.getShoes(false)
            .then((list) => {
                if (!isMounted) return;
                if (list && list.length > 0) {
                    // 대표 러닝화 우선, 없으면 첫 번째 신발
                    const def = list.find((s) => s.isDefault) || list[0];
                    setMainShoe(def);
                }
            })
            .catch((err) => console.warn('통계용 러닝화 정보 조회 실패:', err))
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    if (loading) return null;
    if (!mainShoe) return null;

    const { currentDistanceKm = 0, maxDistanceKm = 600, shoeName, brand } = mainShoe;
    const { usageRatePct, remainingDistanceKm, statusConfig } = getShoeStatusInfo(currentDistanceKm, maxDistanceKm);

    return (
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fdfbf7 100%)', border: '1px solid #fed7aa' }}>
            <div className="stat-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.1rem' }}>👟</span>
                    <span style={{ fontWeight: 'bold', color: '#9a3412' }}>대표 러닝화 수명 트래킹</span>
                </div>
                <span
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: statusConfig.badgeBg,
                        color: statusConfig.badgeColor,
                        border: `1px solid ${statusConfig.badgeBorder}`
                    }}
                >
                    [{statusConfig.label}]
                </span>
            </div>

            <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{shoeName}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{brand}</span>
                </div>

                {/* 프로그레스 바 */}
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', margin: '6px 0' }}>
                    <div
                        style={{
                            width: `${Math.min(usageRatePct, 100)}%`,
                            height: '100%',
                            backgroundColor: statusConfig.progressColor,
                            transition: 'width 0.3s ease'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                    <span><strong>{currentDistanceKm} km</strong> / {maxDistanceKm} km</span>
                    <span style={{ fontWeight: 'bold', color: statusConfig.badgeColor }}>{usageRatePct}% 소진</span>
                </div>

                {/* 수명 경고 시 알림 배너 */}
                {statusConfig.warningBanner ? (
                    <div style={{ marginTop: '8px', padding: '8px 10px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '6px', fontSize: '0.78rem', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} color="#ea580c" />
                        <span>{statusConfig.warningMessage}</span>
                    </div>
                ) : (
                    <div style={{ marginTop: '8px', padding: '6px 10px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '6px', fontSize: '0.78rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={14} color="#16a34a" />
                        <span>쿠션 상태 양호 (잔여 {remainingDistanceKm} km)</span>
                    </div>
                )}

                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/shoes')}
                        style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                        러닝화 관리 바로가기 <ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}
