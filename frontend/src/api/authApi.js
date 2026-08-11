import axiosInstance from "./axiosInstance";

export const authApi = {
    // 로그인 요청 
    login: async (email, password) => {
        const response = await axiosInstance.post('/v1/auth/login', {email, password});
        return response.data.data;
    },

    // 회원가입 요청
    signup: async(signupData) => {
        const response = await axiosInstance.post('/v1/auth/signup', signupData);
        return response.data.data;
    }
}