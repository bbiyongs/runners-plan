import axios from "axios";

const STAT_API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchRunnerAnalytics = async(runnerId, targetYearMonth=null) => {
    let url = `${STAT_API_BASE_URL}/stats/analytics/${runnerId}`;
    if(targetYearMonth) {
        url += `?target_year_month=${targetYearMonth}`;
    }
    const response = await axios.get(url);
    return response.data;
}

