import axiosInstance from "./axiosInstance";

export const weatherApi = {
    // db 에 등록된 지역 목록 조회
    getLocationList : async () => {
        try {
            const response = await axiosInstance.get("/v1/weather/locations");
            return response.data;
        } catch (error) {
            console.error("지역 목록 조회 실패 : ", error);
            return ["서울/수도권 북부"]; // Fallback
        }
    },

    // 선택 지역,날짜,시간 기반 날씨 조회
    lookupWeather : async (location, data, time) => {
        try{

            const response = await axiosInstance.get("/v1/weather/lookup", {
                params: {location, data, time}
            });
            return response.data;
        } catch (error) {
            console.error("날씨 조회 실패 : ", error);
            return null;
        }
    }
}