import React from "react";
import { HeartPulse, BarChart2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import ErrorState from "../components/common/ErrorState";
import CareTabContent from "../components/stats/CareTabContent";
import ReportTabContent from "../components/stats/ReportTabContent";

import '../styles/Dashboard.css';

import { useStats } from "../hooks/useStats";

export default function StatsPage() {

    const {
        data,
        loading,
        error,
        activeTab,
        userInfo,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        refetchStats
    } = useStats();

    const formatChange = (pct) => {
        if (pct === null || pct === undefined) return "비교 데이터 없음";
        const sign = pct >= 0 ? "+" : "";
        return `${sign}${pct}%`;
    };

    if (loading) return <div style={{ padding: '2rem' }}>📊 러닝 데이터 분석 연산 중...</div>;
    if (error) return <ErrorState title="통계 데이터를 불러올 수 없습니다" message={error} onRetry={refetchStats} />;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">

                {/* 1. 헤더 및 탭 전환 버튼 */}
                <header className="dashboard-header header-with-tabs">
                    <div>
                        <h1 className="dashboard-title">러닝 분석 및 통계</h1>
                        <p className="dashboard-subtitle">
                            <strong>{userInfo?.nickname}</strong>님의 러닝 데이터 시계열 분석 리포트입니다.
                        </p>
                    </div>
                    <div className="tab-btn-group">
                        <button
                            onClick={() => setActiveTab('care')}
                            className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`}
                        >
                            <HeartPulse size={16} /> 실시간 케어
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
                        >
                            <BarChart2 size={16} /> 월간 성과 리포트
                        </button>
                    </div>
                </header>
                {/* 2. 탭 1: 실시간 부상방지 & 케어 화면 */}
                {activeTab === 'care' && (
                    <CareTabContent data={data} />
                )}
                {/* 3. 탭 2: 월간 성과 리포트 화면 */}
                {activeTab === 'report' && (
                    <ReportTabContent
                        data={data}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        formatChange={formatChange}
                    />
                )}
            </main>
        </div>
    );
}