import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";
import { setAuthToken } from "../api/axiosInstance";

const AuthContext = createContext(null);

export function AuthProvider({children}) {

    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const BASE_AUTH_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8080/api';

    // 토큰 상태와 axiosInstance 메모리 변수를 동기화
    const updateToken = useCallback((newToken)=> {
        setToken(newToken);
        setAuthToken(newToken);
    }, []);

    // 새로고침 , 첫접속 시 httponly 쿠키로 토큰 재발급
    const silentRefresh = useCallback(async() => {
        try {  
            const res = await axios.post(`${BASE_AUTH_URL}/v1/auth/refresh`, {}, {withCredentials: true, timeout: 3000});
            const newAccessToken = res.data?.data?.accessToken;
            if(newAccessToken){
                updateToken(newAccessToken);
                return newAccessToken;
            } else {
                updateToken(null);
                return null;
            }
        } catch (err) {
            console.warn('[Auth] 토큰 재발급 실패:', err.message);
            updateToken(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [BASE_AUTH_URL, updateToken]);

    // 컵포넌트 마운트 시 무음 토큰 재발급 자동 실행
    useEffect(()=> {
        silentRefresh();
    }, [silentRefresh]);

    // 로그인 성공 시 메모리에만 accessToken 저장
    const login = useCallback((accessToken) => {
        if(accessToken) {
            updateToken(accessToken);
        }
    }, [updateToken]);

    // 로그아웃 시 백엔드 쿠키 제거 API 호출 및 메모리 토큰 초기화
    const logout = useCallback(async()=> {
        try{
            await axios.post(`${BASE_AUTH_URL}/v1/auth/logout`, {}, {withCredentials:true});
        } catch (e){
            console.error("로그아웃 처리 중 오류 ", e);
        }

        updateToken(null);
    }, [BASE_AUTH_URL, updateToken]);

    // 인터셉터 토큰 갱신 이벤트 수신
    useEffect(() => {
        const handleTokenRefreshed = (e) => {
            if(e.detail?.token) {
                updateToken(e.detail.token);
            }
        };
        window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
        return () => window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
    }, [updateToken]);

    const isAuthenticated = !!token;

    // if(loading) {
    //     return (
    //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    //             인증 정보를 확인 중입니다...
    //         </div>
    //     );
    // }

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, loading, login, logout, silentRefresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
