import axios from "axios";

let inMemoryAccessToken = null;

export const setAuthToken = (token) => {
    inMemoryAccessToken = token;
}

export const getAuthToken = () => inMemoryAccessToken;

// 백엔드 주소 및 공통 설정
const axiosInstance = axios.create({
    baseURL : import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080/api',
    timeout : 5000,
    withCredentials : true, // 쿠키 자동 전송 활성화
    headers : {
        'Content-Type' : 'application/json',
    },
});

// 백엔드로 보내기 직전에 실행되는 코드 , 요청 인터셉트
axiosInstance.interceptors.request.use(
    (config) => {
        if(inMemoryAccessToken) {
            config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 백엔드에서 응답 받은 직후 실행 , 응답 인터셉트
axiosInstance.interceptors.response.use(
    (response) => {
        // 백엔드가 보내준 새 토큰 헤더 
        const newToken = response.headers['authorization'];
        if(newToken) {
            const tokenValue = newToken.replace('Bearer ', '');
            inMemoryAccessToken = tokenValue; // 메모리 갱신
            window.dispatchEvent(new CustomEvent('auth:token-refreshed', {detail: {token:tokenValue}}));
        }

        return response;
    },
    (error) => {
        if(error.response && error.response.status === 401) {
            inMemoryAccessToken = null;
            //alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
            //window.location.href = '/';
            window.dispatchEvent(new CustomEvent('auth:expired'));
            window.location.replace('/');
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;