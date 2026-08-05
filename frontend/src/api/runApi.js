import axiosInstance from "./axiosInstance";

export const runApi = {
    // 러닝 기록 목록 조회 GET /api/v1/runs
    getMyRunRecords: async(startDate, endDate) => {
        try {
            const response = await axiosInstance.get('/v1/runs', {
                params: {startDate, endDate},
            });

            return response.data.data;
        } catch (error) {
            console.log('러닝 기록 목록 조회 실패 : ' , error);
            throw error;
        }
    },

    // 러닝기록 상세조회  GET /api/v1/runs/{id}
    getRunRecordDetail: async (runRecordId) => {
        try {
        const response = await axiosInstance.get(`/v1/runs/${runRecordId}`);
        return response.data.data;
        } catch (error) {
            console.log('러닝 상세기록 조회 실패 : ' , error);
            throw error;
        }
    },

    // 러닝 기록 등록  POST /api/v1/runs
    createRunRecord: async (runData) => {
        try {
            const response = await axiosInstance.post('/v1/runs', runData);
            return response.data.data;
        } catch (error) {
            console.log('러닝 등록 실패 : ' , error);
            throw error;
        }
    },
    // 기록 삭제
    deleteRunRecord: async(runRecordId) => {
        try {
            const response = await axiosInstance.delete(`/v1/runs/${runRecordId}`);
        } catch(error) {
            console.error("기록 삭제 실패 : " , error);
            throw error;
        }
    },
    // 러닝 기록 수정
    updateRunRecord: async (runRecordId, runData) => {
        try{
            const response = await axiosInstance.put(`/v1/runs/${runRecordId}` , runData);
            return response.data.data;
        } catch (error) {
            console.error('기록 수정 실패 : ', error );
            throw error;
        }
    }, 
}