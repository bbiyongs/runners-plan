import React, { useEffect, useState } from "react";
import { Activity, Flame, AlertTriangle, ShieldCheck, Zap, TrendingUp, Award } from "lucide-react";
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

                const analyticsData = await fetchRunnerAnalytics(myInfo.runnerId);
                setData(analyticsData);

            } catch (err) {
                console.error("동적 통계 데이터 로딩 실패 ", err);
                setError("통계 데이터를 불러오는 중 오류 발생");
            } finally {
                setLoading(false);
            }
        }

        loadStatsData();
    }, []);

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
                {/* 헤더 영역 */}
                <header className="dashboard-header">
                    <h1 className="dashboard-title">📈 통계 및 인사이트 분석</h1>
                    <p className="dashboard-subtitle">
                        반갑습니다, <strong>{userInfo?.nickname || '러너'}</strong>님! Pandas 시계열 분석 리포트입니다.
                    </p>
                </header>

                {/* 1층: 상단 3개 요약 카드 (card-grid) */}
                <div className="card-grid">
                    {/* [카드 1] 전년 동월 대비 (YoY) 성과 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <span>전년 동월 대비</span>
                            <Award size={20} color="#8b5cf6" />
                        </div>
                        <div className="stat-card-value" style={{ color: '#8b5cf6' }}>
                            {data?.growth?.yoy_distance_change_pct != null
                                ? formatChange(data.growth.yoy_distance_change_pct)
                                : "작년 기록 대기 중"}
                        </div>
                        <div className="stat-card-sub">
                            {data?.growth?.yoy_pace_change_sec != null
                                ? (data.growth.yoy_pace_change_sec < 0 ? `페이스 ${Math.abs(data.growth.yoy_pace_change_sec)}초 단축 🏆` : `페이스 ${data.growth.yoy_pace_change_sec}초 증가`)
                                : "작년 동일 월 기록과 비교"}
                        </div>
                    </div>
                    {/* [카드 2] 전월 대비 (MoM) 성과 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <span>전월 대비</span>
                            <TrendingUp size={20} color="#3b82f6" />
                        </div>
                        <div className="stat-card-value" style={{ color: '#3b82f6' }}>
                            {data?.growth?.mom_distance_change_pct != null
                                ? formatChange(data.growth.mom_distance_change_pct)
                                : "지난달 기록 대기 중"}
                        </div>
                        <div className="stat-card-sub">
                            {data?.growth?.mom_pace_change_sec != null
                                ? (data.growth.mom_pace_change_sec < 0 ? `페이스 ${Math.abs(data.growth.mom_pace_change_sec)}초 단축 ⚡` : `페이스 ${data.growth.mom_pace_change_sec}초 증가`)
                                : "지난달 대비 페이스 및 거리 비교"}
                        </div>
                    </div>

                    {/* ACWR 부상 위험 지수 카드 */}
                    <AcwrRiskCard acwrData={data?.acwr} />
                </div>

                {/* 2층: 100% 풀-위드 메인 시계열 차트 영역 */}
                <div className="dashboard-widget-card" style={{ marginTop: '1.5rem' }}>
                    <h3 className="widget-title">📈 7일 / 30일 이동평균 (Rolling Average) 훈련 트렌드</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        일별 거리 변화와 이동 평균선을 비교하여 나의 훈련 강도 흐름을 한눈에 파악하세요.
                    </p>
                    <TrainingTrendChart data={data?.rolling_trends} />
                </div>

                {/* 3층: 하단 2단 세부 분석 영역 (dashboard-lower-grid) */}
                <div className="dashboard-lower-grid" style={{ marginTop: '1.5rem' }}>
                    {/* 좌측: 요일/시간대 핫스팟 파워 맵 */}
                    <PerformanceHeatmapCard heatmapData={data?.heatmap} />

                    {/* 우측: 훈련 코칭 팁 카드 */}
                    <div className="dashboard-widget-card">
                        <h3 className="widget-title">💡 러닝 코치 분석 총평</h3>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginTop: '12px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                                현재 <strong>ACWR 비율({data?.acwr?.acwr_ratio})</strong>과 이동평균 훈련량을 분석한 결과,
                                안전한 범위 내에서 매우 안정적으로 훈련량을 유지하고 계십니다!
                                가장 성과가 좋은 <strong>{data?.heatmap?.points?.[0]?.weekday || '주중'} 시간대</strong>를 활용해 템포런을 시도해 보세요.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}