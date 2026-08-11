// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Activity, Flame, Calendar, Award, Timer } from 'lucide-react';
// recharts 컴포넌트 추가 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import { dashboardApi } from '../api/dashboardApi';
import '../styles/Dashboard.css';

export default function DashboardPage() {

  // 데이터 상태 선언 
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const translateTrainingType = (code) => {
    const types = { EASY: '조깅', TEMPO: '템포런', INTERVAL: '인터벌', LSD: 'LSD', RECOVERY: '회복런', RACE: '대회' };

    return types[code] || code;
  };

  //  처음 열릴때 API 호출하는 react hook : uesEffect
  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await dashboardApi.getMyDashboard();
        if (!data) {
          alert('사용자 정보를 찾을수 없습니다.');
          localStorage.removeItem('accessToken');
          window.location.href = '/';
          return;
        }
        setDashboardData(data);
      } catch (err) {
        console.error('데이터 불러오는중 에러 발생 : ', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);


  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        {loading ? (
          <div style={{ padding: '20px' }}>대시보드 정보를 불러오는 중...</div>
        ) : (
          <>
            <header className="dashboard-header">
              <h1 className="dashboard-title">대시보드</h1>
              <p className="dashboard-subtitle">
                반갑습니다, <strong>{dashboardData?.nickname}</strong>님! (등급: {dashboardData?.levelName})
              </p>
            </header>
            {/* 백엔드 DashboardResponse 규격에 맞춘 카드 4개 */}
            <div className="card-grid">
              <StatCard
                title="이번 달 러닝 거리"
                value={`${dashboardData?.monthlyDistanceKm} km`}
                subtext={`이번 달 총 ${dashboardData?.monthlyRunCount}회 운동`}
                Icon={Activity}
                iconColor="var(--primary)"
              />
              <StatCard
                title="전체 누적 거리"
                value={`${dashboardData?.totalDistanceKm} km`}
                subtext={`누적 러닝 ${dashboardData?.totalRunCount}회 달성`}
                Icon={Award}
                iconColor="var(--success)"
              />
              <StatCard
                title="평균 페이스"
                value={dashboardData?.formattedAvgPace || "00'00\""}
                subtext="전체 러닝 평균 페이스"
                Icon={Timer}
                iconColor="var(--warning)"
              />
              <StatCard
                title="이번 달 운동 횟수"
                value={`${dashboardData?.monthlyRunCount} 회`}
                subtext={`러닝 등급: ${dashboardData?.levelName}`}
                Icon={Calendar}
                iconColor="#8b5cf6"
              />
            </div>

            {/* ⬇️ 백엔드 연동 하단 레이아웃 영역 */}
            <div className="dashboard-lower-grid">

              {/* 좌측: 최근 운동 기록 피드 (백엔드 recentActivities 바인딩) */}
              <div className="dashboard-widget-card">
                <h3 className="widget-title">최근 운동 기록</h3>
                <div className="activity-feed-list">
                  {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((act) => (
                      <div key={act.runRecordId} className="activity-feed-item">
                        <div className="feed-item-left">
                          <span className="feed-date">{act.runDate}</span>
                          <span className="feed-title">{act.memo || 'Garmin 연동 러닝'}</span>
                        </div>
                        <div className="feed-item-right">
                          <span className="feed-distance">{act.distanceKm} km</span>
                          <span className="feed-pace">{act.formattedAvgPace || "--'--\""} /km</span>
                          <span className="feed-badge">{translateTrainingType(act.trainingTypeCode)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '30px 0' }}>
                      등록된 러닝 기록이 없습니다.
                    </div>
                  )}
                </div>
              </div>
              {/* 우측: 월별 러닝 거리 추이 차트 (백엔드 monthlyTrends 바인딩) */}
              <div className="dashboard-widget-card">
                <h3 className="widget-title">월별 러닝 거리 추이 (km)</h3>
                <div style={{ width: '100%', height: '220px', marginTop: '15px' }}>
                  {dashboardData?.monthlyTrends && dashboardData.monthlyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="yearMonth" tickLine={false} axisLine={false} stroke="#64748b" style={{ fontSize: '0.8rem' }} />
                        <YAxis tickLine={false} axisLine={false} stroke="#64748b" style={{ fontSize: '0.8rem' }} />
                        <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
                        <Bar dataKey="distanceKm" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={35} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '80px 0' }}>
                      차트를 구성할 월별 러닝 데이터가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}