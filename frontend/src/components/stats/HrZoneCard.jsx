import React from "react";
import { Heart } from "lucide-react";

const HrZoneCard = ({ zoneData }) => {
    if (!zoneData) return null;

    const zones = [
        { label: 'Z1 회복', pct: zoneData.zone1_pct, color: '#94a3b8' },
        { label: 'Z2 유산소', pct: zoneData.zone2_pct, color: '#10b981' },
        { label: 'Z3 템포', pct: zoneData.zone3_pct, color: '#3b82f6' },
        { label: 'Z4 역치', pct: zoneData.zone4_pct, color: '#f59e0b' },
        { label: 'Z5 무산소', pct: zoneData.zone5_pct, color: '#ef4444' },
    ];

    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <span style={{ fontWeight: 'bold', color: '#1e293b' }}>🫀 심박수 훈련 구간 (Zone 1~5)</span>
                <Heart size={20} color="#ef4444" />
            </div>
            <div style={{ marginTop: '12px' }}>
                {/* 멀티 프로그레스 바 */}
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: '#e2e8f0', marginBottom: '12px' }}>
                    {zones.map((z, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: `${z.pct}%`,
                                background: z.color,
                                height: '100%',
                                transition: 'width 0.5s ease'
                            }}
                            title={`${z.label}: ${z.pct}%`}
                        />
                    ))}
                </div>
                {/* 구간별 비율 리스트 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '0.75rem' }}>
                    {zones.map((z, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: z.color }} />
                            <span style={{ color: '#64748b' }}>{z.label}:</span>
                            <strong style={{ color: '#1e293b' }}>{z.pct}%</strong>
                        </div>
                    ))}
                </div>
                {/* 주요 훈련 요약 */}
                <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 'bold', marginTop: '10px', background: '#ecfdf5', padding: '6px 8px', borderRadius: '6px' }}>
                    🏆 {zoneData.primary_zone_text}
                </div>
            </div>
        </div>
    );
}

export default HrZoneCard;