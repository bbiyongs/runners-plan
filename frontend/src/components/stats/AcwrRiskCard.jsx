import React from "react";
import { ShieldCheck, AlertTriangle, Info, AlertOctagon } from "lucide-react";

export default function AcwrRiskCard({ acwrData }) {
    if (!acwrData) return null;

    const { acwr_ratio, acute_workload, chronic_workload, risk_level, insight_text } = acwrData;

    // 위험 등급별 색상 및 아이콘 설정
    const getRiskTheme = (level) => {
        switch (level) {
            case 'SAFE':
                return { color: '#10b981', bg: '#ecfdf5', label: '안전', Icon: ShieldCheck };
            case 'WARNING':
                return { color: '#f59e0b', bg: '#fffbeb', label: '주의', Icon: AlertTriangle };
            case 'DANGER':
                return { color: '#ef4444', bg: '#fef2f2', label: '위험', Icon: AlertOctagon };
            default:
                return { color: '#3b82f6', bg: '#eff6ff', label: '미달', Icon: Info };
        }
    };

    const theme = getRiskTheme(risk_level);
    const Icon = theme.Icon;

    const progressPercent = Math.min(Math.max((acwr_ratio / 2.0) * 100, 5), 100);

    return (
        <div className="stat-card" style={{ borderLeft: `5px solid ${theme.color}` }}>
            <div className="stat-card-header">
                <span>부상 위험 방지 지수 (ACWR)</span>
                <Icon size={20} color={theme.color} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 4px 0' }}>
                <span className="stat-card-value" style={{ color: theme.color, margin: 0 }}>
                    {acwr_ratio}
                </span>
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: theme.color,
                    backgroundColor: theme.bg,
                    padding: '2px 8px',
                    borderRadius: '12px'
                }}>
                    {theme.label}
                </span>
            </div>
            {/* 시각적 프로그레스 게이지 바 */}
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', margin: '10px 0 8px 0', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: theme.color, transition: 'width 0.5s ease-in-out' }} />
            </div>
            <div className="stat-card-sub" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                최근 7일: <strong>{acute_workload}km</strong> / 28일 평균: <strong>{chronic_workload}km</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '8px', lineHeight: '1.4' }}>
                {insight_text}
            </p>
        </div>
    );
}