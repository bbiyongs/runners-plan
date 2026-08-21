import { useState, useEffect } from "react";
import { dashboardApi } from "../api/dashboardApi";

export function useDashboard() {
    // 데이터 상태 선언 
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await dashboardApi.getMyDashboard();
            if (!data) {
                // alert('사용자 정보를 찾을수 없습니다.');
                // localStorage.removeItem('accessToken');
                // window.location.href = '/';
                // return;
                setError('사용자 정보를 불러올 수 없습니다. 다시 로그인해 주세요.');
                return;
            }
            setDashboardData(data);
        } catch (err) {
            console.error('데이터 불러오는중 에러 발생 : ', err);
            setError('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return {
        dashboardData,
        loading,
        error,
        refetchDashboard: fetchDashboard 
    };
}