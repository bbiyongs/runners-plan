import axios from "axios";

const STAT_API_BASE_URL = import.meta.env.VITE_STAT_API_URL || 'http://localhost:8000/api/v1/garmin';

const garminClient = axios.create({
    baseURL : STAT_API_BASE_URL,
    timeout: 180000, // 통신 타임아웃 60초 -> 3분으로 연장
    headers : {
        'Content-Type': 'application/json',
    },
});

export const garminApi = {
    // garmin 연동 및 세션 생성
    connectAccount : async (runnerId, garminEmail, garminPassword) => {
        const response = await garminClient.post('/connect', {
            runner_id : runnerId,
            garmin_email : garminEmail,
            garmin_password : garminPassword,
        });
        return response.data;
    },

    // garmin 연동 상태 및 동기화 조회
    getStatus: async(runnerId) => {
        const response = await garminClient.get(`/status/${runnerId}`);
        return response.data;
    },

    // 과거 전체 기록 초기 동기화 
    syncInitialHistory: async (runnerId) => {
        const response = await garminClient.post(`/sync-initial/${runnerId}`);
        return response.data;
    },

    //최근 기록 수동 증분 동기화
    syncRecentActivities: async (runnerId, limit = 10) => {
        const response = await garminClient.post(`/sync-recent/${runnerId}?limit=${limit}`);
        return response.data;
    }
}