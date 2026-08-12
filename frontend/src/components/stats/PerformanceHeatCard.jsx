import React from "react";
import { Zap, Clock } from "lucide-react";

export default function PerformanceHeatmapCard({ heatmapData }) {
    if (!heatmapData) return null;

    const { best_slot_text, points } = heatmapData;

    const formatPace = (sec) => {
        if (!sec) return "--'--\"";
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}'${s < 10 ? '0' : ''}${s}"`;
    }

    return (
        <div className="dashboard-widget-card">
            <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="#eab308" /> 요일 / 시간대별 러닝 핫스팟
            </h3>

            <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', padding: '12px', borderRadius: '10px', margin: '12px 0' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#854d0e', margin: 0 }}>
                    {best_slot_text}
                </p>
            </div>
            {/* 시간대별 성과 태그 리스트 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginTop: '12px' }}>
                {points && points.slice(0, 6).map((pt, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {pt.weekday}요일 {pt.time_slot}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
                            {formatPace(pt.avg_pace_sec)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{pt.run_count}회 운동</div>
                    </div>
                ))}
            </div>
        </div>
    );
}