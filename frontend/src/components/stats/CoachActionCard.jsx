import React from "react";
import { Activity, Flame, ShieldAlert, Heart, CheckCircle2 } from "lucide-react";

const CoachActionCard = ({ coachData }) => {
    if (!coachData) return null;

    return(
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f4f9f5 100%)', border: '1px solid #c8e6c9' }}>
            <div className="stat-card-header">
                <span style={{ fontWeight: 'bold', color: '#1b382b' }}>💡 오늘의 코치 맞춤 액션</span>
                <Activity size={20} color="#2e7d32" />
            </div>
            <div style={{ marginTop: '12px' }}>
                {/* 훈련 타이틀 */}
                <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={18} color="#2e7d32" />
                    {coachData.action_title}
                </div>
                {/* 목표 수치 가이드 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#eef6f0', padding: '10px', borderRadius: '8px', fontSize: '0.82rem' }}>
                    <div>
                        <span style={{ color: '#4a6356' }}>권장 페이스:</span>
                        <div style={{ fontWeight: 'bold', color: '#192e24', marginTop: '2px' }}>{coachData.target_pace_text}</div>
                    </div>
                    <div>
                        <span style={{ color: '#4a6356' }}>권장 심박수:</span>
                        <div style={{ fontWeight: 'bold', color: '#ef4444', marginTop: '2px' }}>{coachData.target_hr_text}</div>
                    </div>
                </div>
                {/* 조언 메시지 */}
                <p style={{ fontSize: '0.8rem', color: '#4a6356', marginTop: '10px', marginBottom: 0, lineHeight: '1.4' }}>
                    {coachData.coaching_message}
                </p>
            </div>
        </div>
    );
};

export default CoachActionCard;