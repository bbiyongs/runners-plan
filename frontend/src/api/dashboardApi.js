import axiosInstance from "./axiosInstance";

export const dashboardApi = {
    // 대시보드 요약 통계 정보 가져오기
    getMyDashboard: async() => {
        try {
            const response = await axiosInstance.get('/v1/runners/me/dashboard');
            return response.data.data;

            /* 💡 백엔드 DashboardResponse DTO와 100% 동일한 Mock 데이터 구조
            return {
                runnerId: 1,
                nickname: "러너홍",
                profileImageUrl: null,
                levelCode: "LV2",
                levelName: "아마추어 러너",
                // 전체 누적 통계
                totalDistanceKm: 154.2,
                totalRunCount: 25,
                totalDurationSec: 32400,
                avgPaceSec: 330,
                formattedAvgPace: "05'30\"",
                // 이번 달 통계
                monthlyDistanceKm: 42.5,
                monthlyRunCount: 8,
                monthlyDurationSec: 9600,
            };
            */
        } catch (error) {
            console.error('대시보드 조회 실패 : ' , error);
            throw error;
        }
    },

}