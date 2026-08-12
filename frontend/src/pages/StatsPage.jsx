import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, Zap, TrendingUp, Award, HeartPulse, BarChart2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { fetchRunnerAnalytics } from "../api/statsApi";
import '../styles/Dashboard.css';

import TrainingTrendChart from "../components/stats/TrainingTrendChart";
import AcwrRiskCard from "../components/stats/AcwrRiskCard";
import PerformanceHeatmapCard from "../components/stats/PerformanceHeatCard";
import { dashboardApi } from "../api/dashboardApi";

export default function StatsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);

    // 탭 상태 
    const [activeTab, setActiveTab] = useState('care');

    // 선택한 년 월 상태 추가
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
    })

    useEffect(() => {
        async function loadStatsData() {
            try {
                setLoading(true);

                const myInfo = await dashboardApi.getMyDashboard();
                if (!myInfo || !myInfo.runnerId) {
                    setError("로그인 유저 정보를 찾을수 없습니다.");
                    return;
                }
                setUserInfo(myInfo);

                const targetMonthParam = activeTab === 'report' ? selectedMonth : null;
                const analyticsData = await fetchRunnerAnalytics(myInfo.runnerId, selectedMonth);
                setData(analyticsData);

            } catch (err) {
                console.error("동적 통계 데이터 로딩 실패 ", err);
                setError("통계 데이터를 불러오는 중 오류 발생");
            } finally {
                setLoading(false);
            }
        }

        loadStatsData();
    }, [setActiveTab, selectedMonth]);

    const formatChange = (pct) => {
        if (pct === null || pct === undefined) return "비교 데이터 없음"
        const sign = pct >= 0 ? "+" : "";
        return `${sign}${pct}%`;
    };

    const formatPaceDiff = (sec) => {
        if (sec === null || sec === undefined) return "페이스 변화 수집 중";
        if (sec < 0) return `페이스 ${abs(sec)}초 단축 🏆`;
        if (sec > 0) return `페이스 ${sec}초 지연`;
        return `페이스 동일 유지`;
    }

    if (loading) return <div style={{ padding: '2rem' }}>📊 러닝 데이터 분석 연산 중...</div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">

                {/* 1. 헤더 및 탭 전환 버튼 */}
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                    <div>
                        <h1 className="dashboard-title">📈 통계 및 인사이트 대시보드</h1>
                        <p className="dashboard-subtitle">
                            반갑습니다, <strong>{userInfo?.nickname || '러너'}</strong>님!
                            {activeTab === 'care' ? ' 오늘의 실시간 케어 리포트입니다.' : ' 선택한 월의 성과 리포트입니다.'}
                        </p>
                    </div>
                    {/* 💡 탭 버튼 영역 */}
                    <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
                        <button
                            onClick={() => setActiveTab('care')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: activeTab === 'care' ? '#ffffff' : 'transparent',
                                color: activeTab === 'care' ? '#6366f1' : '#64748b',
                                boxShadow: activeTab === 'care' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <HeartPulse size={16} /> 실시간 케어
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: activeTab === 'report' ? '#ffffff' : 'transparent',
                                color: activeTab === 'report' ? '#6366f1' : '#64748b',
                                boxShadow: activeTab === 'report' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            <BarChart2 size={16} /> 월간 성과 리포트
                        </button>
                    </div>
                </header>
                {/* 2. 탭 1: 실시간 부상방지 & 케어 화면 */}
                {activeTab === 'care' && (
                    <div>
                        <div className="card-grid">
                            {/* 오늘의 ACWR 부상 위험 지수 */}
                            <AcwrRiskCard acwrData={data?.acwr} />
                            {/* 러닝 코치 종합 진단 카드 */}
                            <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                                <div className="stat-card-header">
                                    <span>💡 오늘의 러닝 코치 종합 진단</span>
                                    <Activity size={20} color="#6366f1" />
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginTop: '12px' }}>
                                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                                        현재 <strong>EWMA 부상 지수({data?.acwr?.acwr_ratio})</strong>를 진단한 결과,
                                        {data?.acwr?.insight_text}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* 요일/시간대 핫스팟 파워 맵 */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <PerformanceHeatmapCard heatmapData={data?.heatmap} />
                        </div>
                    </div>
                )}
                {/* 3. 탭 2: 월간 성과 리포트 화면 */}
                {activeTab === 'report' && (
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
                                <div className="stat-card-sub" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                                    {data?.growth?.prev_year_mtd_distance_km != null ? (
                                        <>
                                            <div>· 올해 {data.growth.max_day}일까지: <strong>{data.growth.current_mtd_distance_km} km</strong></div>
                                            <div>· 작년 {data.growth.max_day}일까지: <strong>{data.growth.prev_year_mtd_distance_km} km</strong></div>
                                        </>
                                    ) : (
                                        "작년 동월 기록과 비교 데이터 수집 중"
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
                                <div className="stat-card-sub" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
                                    {data?.growth?.prev_month_mtd_distance_km != null ? (
                                        <>
                                            <div>· 이번달 {data.growth.max_day}일까지: <strong>{data.growth.current_mtd_distance_km} km</strong></div>
                                            <div>· 지난달 {data.growth.max_day}일까지: <strong>{data.growth.prev_month_mtd_distance_km} km</strong></div>
                                        </>
                                    ) : (
                                        "지난달 동기간 데이터와 비교 대기 중"
                                    )}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card-header">
                                    <span>선택 월 누적 거리</span>
                                    <Activity size={20} color="#10b981" />
                                </div>
                                <div className="stat-card-value" style={{ color: '#10b981' }}>
                                    {data?.total_distance_km} km
                                </div>
                                <div className="stat-card-sub">총 {data?.total_runs}회 러닝</div>
                            </div>
                        </div>
                        {/* 2층: 선택한 월의 Recharts 훈련량 이동평균 차트 */}
                        <div className="dashboard-widget-card" style={{ marginTop: '1.5rem' }}>
                            <h3 className="widget-title">📈 선택한 월의 훈련량 & 이동평균 트렌드</h3>
                            <TrainingTrendChart data={data?.rolling_trends} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}