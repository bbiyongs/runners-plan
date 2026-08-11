import axios from "axios";

// 백엔드 주소 및 공통 설정
const axiosInstance = axios.create({
    baseURL : 'http://localhost:8080/api',
    timeout : 5000,
    headers : {
        'Content-Type' : 'application/json',
    },
});

// 백엔드로 보내기 직전에 실행되는 코드 , 요청 인터셉트
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 백엔드에서 응답 받은 직후 실행 , 응답 인터셉트
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            console.warn('인증이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;