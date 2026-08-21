import axiosInstance from "./axiosInstance";

const STAT_BASE = import.meta.env.VITE_STAT_SERVICE_URL || 'http://localhost:8000';

export const garminApi = {
    // garmin 연동 및 세션 생성
    connectAccount : async ( garminEmail, garminPassword) => {
        const response = await axiosInstance.post(`${STAT_BASE}/api/v1/garmin/connect`, {
            garmin_email : garminEmail,
            garmin_password : garminPassword,
        });
        return response.data;
    },

    // garmin 연동 상태 및 동기화 조회
    getStatus: async(runnerId) => {
        const response = await axiosInstance.get(`${STAT_BASE}/api/v1/garmin/status/${runnerId}`);
        return response.data;
    },

    // 과거 전체 기록 초기 동기화 
    syncInitialHistory: async (runnerId) => {
        const response = await axiosInstance.post(`${STAT_BASE}/api/v1/garmin/sync-initial/${runnerId}`);
        return response.data;
    },

    //최근 기록 수동 증분 동기화
    syncRecentActivities: async (runnerId, limit = 10) => {
        const response = await axiosInstance.post(`${STAT_BASE}/api/v1/garmin/sync-recent/${runnerId}?limit=${limit}`);
        return response.data;
    }
}