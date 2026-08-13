import React from "react";
import { Award, TrendingUp, Heart } from 'lucide-react'
import TrainingTrendChart from "./TrainingTrendChart";


export default function ReportTabContent({ data, selectedMonth, setSelectedMonth, formatChange }) {
    return (
        <div>
            {/* 상단 컨트롤: 년/월 선택 픽커 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>조회 월 선택:</span>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer' }}
                    />
                </div>
            </div>
            {/* 1층: YoY, MoM, 선택 월 총 거리 카드 */}
            <div className="card-grid">
                {/* [카드 1] 전년 동월 대비 (YoY) 성과 */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>전년 동월 대비 (YoY)</span>
                        <Award size={20} color="#8b5cf6" />
                    </div>
                    <div className="stat-card-value" style={{ color: '#8b5cf6' }}>
                        {formatChange(data?.growth?.yoy_distance_change_pct)}
                    </div>
                    <div className="stat-card-sub" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6' }}>
                        {data?.growth?.prev_year_mtd_distance_km != null ? (
                            <>
                                <div>· 거리: <strong>{data.growth.current_mtd_distance_km} km</strong> (작년: {data.growth.prev_year_mtd_distance_km} km)</div>
                                {data?.growth?.yoy_pace_change_sec != null && (
                                    <div>
                                        · 페이스: <strong>{data.growth.yoy_pace_change_sec <= 0 ? `${Math.abs(data.growth.yoy_pace_change_sec)}초 단축 🏆` : `${data.growth.yoy_pace_change_sec}초 증가`}</strong>
                                    </div>
                                )}
                                {data?.growth?.yoy_hr_change_bpm != null && (
                                    <div style={{ color: data.growth.yoy_hr_change_bpm <= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                        · 심박수: <strong>{data.growth.yoy_hr_change_bpm <= 0 ? `${Math.abs(data.growth.yoy_hr_change_bpm)}bpm 감소 (심폐 강화) 🫀` : `${data.growth.yoy_hr_change_bpm}bpm 상승`}</strong>
                                    </div>
                                )}
                            </>
                        ) : (
                            "작년 동월 기록 비교 데이터 수집 중"
                        )}
                    </div>
                </div>

                {/* [카드 2] 전월 대비 (MoM) 성과 */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>전월 대비 (MoM)</span>
                        <TrendingUp size={20} color="#3b82f6" />
                    </div>
                    <div className="stat-card-value" style={{ color: '#3b82f6' }}>
                        {formatChange(data?.growth?.mom_distance_change_pct)}
                    </div>
                    <div className="stat-card-sub" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6' }}>
                        {data?.growth?.prev_month_mtd_distance_km != null ? (
                            <>
                                <div>· 거리: <strong>{data.growth.current_mtd_distance_km} km</strong> (지난달: {data.growth.prev_month_mtd_distance_km} km)</div>
                                {data?.growth?.mom_pace_change_sec != null && (
                                    <div>
                                        · 페이스: <strong>{data.growth.mom_pace_change_sec <= 0 ? `${Math.abs(data.growth.mom_pace_change_sec)}초 단축 ⚡` : `${data.growth.mom_pace_change_sec}초 증가`}</strong>
                                    </div>
                                )}
                                {data?.growth?.mom_hr_change_bpm != null && (
                                    <div style={{ color: data.growth.mom_hr_change_bpm <= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                        · 심박수: <strong>{data.growth.mom_hr_change_bpm <= 0 ? `${Math.abs(data.growth.mom_hr_change_bpm)}bpm 감소 (심폐 강화) 🫀` : `${data.growth.mom_hr_change_bpm}bpm 상승`}</strong>
                                    </div>
                                )}
                            </>
                        ) : (
                            "지난달 데이터 비교 대기 중"
                        )}
                    </div>
                </div>
                {/* [카드 3] 선택 월 평균 심박수 & 심폐 상태 카드 */}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>선택 월 평균 심박수</span>
                        <Heart size={20} color="#ef4444" />
                    </div>
                    <div className="stat-card-value" style={{ color: '#ef4444' }}>
                        {data?.growth?.current_avg_hr ? `${data.growth.current_avg_hr} bpm` : "심박 데이터 없음"}
                    </div>
                    <div className="stat-card-sub" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6' }}>
                        {data?.growth?.current_avg_hr ? (
                            <>
                                <div>· 선택 월 총 러닝 횟수: <strong>{data?.growth?.current_month_run_count || 0} 회</strong></div>
                                <div>· 심폐 부하 상태: <strong>{data.growth.current_avg_hr <= 155 ? "안정적인 유산소 구간" : "고강도 템포 구간"}</strong></div>
                            </>
                        ) : (
                            <div>· 선택 월 총 러닝 횟수: <strong>{data?.total_runs || 0} 회</strong></div>
                        )}
                    </div>
                </div>
            </div>
            {/* 2층: 선택한 월의 Recharts 훈련량 이동평균 차트 */}
            <div className="dashboard-widget-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="widget-title">📈 선택한 월의 훈련량 & 이동평균 트렌드</h3>
                <TrainingTrendChart data={data?.rolling_trends} />
            </div>
        </div>
    )
}