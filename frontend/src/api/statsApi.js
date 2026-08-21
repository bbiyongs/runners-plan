import axiosInstance from "./axiosInstance";

const STAT_BASE = import.meta.env.VITE_STAT_SERVICE_URL || 'http://localhost:8000';

export const fetchRunnerAnalytics = async (runnerId, targetYearMonth = null) => {
    let url = `${STAT_BASE}/api/v1/stats/analytics/${runnerId}`;
    if (targetYearMonth) {
        url += `?target_year_month=${targetYearMonth}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
};
