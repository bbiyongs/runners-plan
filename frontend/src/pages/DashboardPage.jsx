// src/pages/DashboardPage.jsx
import React, {useState, useEffect} from 'react';
import { Activity, Flame, Calendar, Award, Timer } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import { dashboardApi } from '../api/dashboardApi';
import '../styles/Dashboard.css';

export default function DashboardPage() {

    // 데이터 상태 선언 
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    //  처음 열릴때 API 호출하는 react hook : uesEffect
    useEffect(() => {
        async function fetchDashboard() {
            try {
                setLoading(true);
                const data = await dashboardApi.getMyDashboard();
                if(!data) {
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
          </>
        )}
      </main>
    </div>
  );
}