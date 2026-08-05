import React, {useEffect} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuth2CallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // URL 파라미터에서 백엔드가 전달한 JWT 토큰 추출
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if(accessToken) {
            //토큰을 브라우저 local-storage 에 보관
            localStorage.setItem('accessToken', accessToken);
            if(refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            alert("로그인에 성공하였습니다.");
            navigate('/dashboard'); // 로그인 후 대시보드 이동
        } else {
            alert('로그인 처리중 오류발생');
            navigate('/');
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>소셜 로그인 처리 중입니다. 잠시만 기다려주세요...</h2>
        </div>
    )
}