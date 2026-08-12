import axios from "axios";

const STAT_API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchRunnerAnalytics = async(runnerId) => {
    const response = await axios.get(`${STAT_API_BASE_URL}/stats/analytics/${runnerId}`);
    return response.data;
}

