import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children}) {
    const token = localStorage.getItem('accessToken');

    // 토큰이 없으면 로그인 화면으로 이동
    if(!token) {
        alert('로그인 세션이 만료되었거나 로그인이 필요합니다.');
        return <Navigate to="/" replace/>;
    }

    return children;
}