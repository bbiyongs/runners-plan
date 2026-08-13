import { useState, useEffect } from "react";
import { dashboardApi } from "../api/dashboardApi";
import { fetchRunnerAnalytics } from "../api/statsApi";

export function useStats() {
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
    });

    const loadStatsData = async () => {
        try {
            setLoading(true);
            setError(null);

            const myInfo = await dashboardApi.getMyDashboard();

            if (!myInfo || !myInfo.runnerId) {
                alert('사용자 정보를 찾을 수 없거나 세션이 만료되었습니다. 다시 로그인해 주세요.');
                localStorage.removeItem('accessToken');
                window.location.href = '/';
                return;
            }
            setUserInfo(myInfo);

            const targetMonthParam = activeTab === 'report' ? selectedMonth : null;
            const analyticsData = await fetchRunnerAnalytics(myInfo.runnerId, targetMonthParam);
            setData(analyticsData);

        } catch (err) {
            console.error("동적 통계 데이터 로딩 실패: ", err);
            setError("통계 데이터를 불러오는 중 일시적인 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect (() => {
        loadStatsData();
    }, [activeTab, selectedMonth]);

    return {
        data,
        loading,
        error,
        userInfo,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        refetchStats: loadStatsData // 다시 시도용 함수 반환
    }
}