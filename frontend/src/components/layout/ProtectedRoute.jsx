import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


export default function ProtectedRoute({children}) {
    const {isAuthenticated, loading} = useAuth();
    // 초기 토큰 확인 중일 때만 로딩 표시
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                인증 정보를 확인 중입니다...
            </div>
        );
    }
    
    if(!isAuthenticated) return <Navigate to="/" replace />;

    return children;
}