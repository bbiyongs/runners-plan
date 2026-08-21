// src/api/shoeApi.js
import axiosInstance from "./axiosInstance";

export const shoeApi = {
    // 1. 러닝화 목록 조회 GET /api/v1/shoes
    getShoes: async (includeRetired = false) => {
        try {
            const response = await axiosInstance.get('/v1/shoes', {
                params: { includeRetired }
            });
            return response.data.data;
        } catch (error) {
            console.error("러닝화 목록 조회 실패 : ", error);
            throw error;
        }
    },

    // 2. 과거 러닝 기록 기반 예상 누적 거리 프리뷰 계산 GET /api/v1/shoes/preview-distance
    previewDistance: async (purchasedDate, usageRatio) => {
        try {
            const response = await axiosInstance.get('/v1/shoes/preview-distance', {
                params: { purchasedDate, usageRatio }
            });
            return response.data.data;
        } catch (error) {
            console.error("예상 누적 거리 계산 실패 : ", error);
            throw error;
        }
    },

    // 3. 러닝화 신규 등록 POST /api/v1/shoes
    createShoe: async (shoeData) => {
        try {
            const response = await axiosInstance.post('/v1/shoes', shoeData);
            return response.data.data;
        } catch (error) {
            console.error("러닝화 등록 실패 : ", error);
            throw error;
        }
    },

    // 4. 러닝화 정보 수정 PUT /api/v1/shoes/{id}
    updateShoe: async (shoeId, shoeData) => {
        try {
            const response = await axiosInstance.put(`/v1/shoes/${shoeId}`, shoeData);
            return response.data.data;
        } catch (error) {
            console.error("러닝화 수정 실패 : ", error);
            throw error;
        }
    },

    // 5. 대표 러닝화 설정 PATCH /api/v1/shoes/{id}/default
    setDefaultShoe: async (shoeId) => {
        try {
            const response = await axiosInstance.patch(`/v1/shoes/${shoeId}/default`);
            return response.data.data;
        } catch (error) {
            console.error("대표 러닝화 설정 실패 : ", error);
            throw error;
        }
    },

    // 6. 러닝화 은퇴(사용 중단) PATCH /api/v1/shoes/{id}/retire
    retireShoe: async (shoeId) => {
        try {
            const response = await axiosInstance.patch(`/v1/shoes/${shoeId}/retire`);
            return response.data.data;
        } catch (error) {
            console.error("러닝화 은퇴 처리 실패 : ", error);
            throw error;
        }
    }
};
