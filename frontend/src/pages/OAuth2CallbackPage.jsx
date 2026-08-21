import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function OAuth2CallbackPage() {
    const navigate = useNavigate();
    const { silentRefresh } = useAuth();

    useEffect(() => {
        silentRefresh().then((token) => {
            if(token) {
                navigate('/dashboard', {replace:true});
            } else {
                alert('로그인 세션을 확인할 수 없습니다. 다시 로그인 해주세요.');
                navigate('/', {replace:true});
            }
        });
    }, [silentRefresh, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>소셜 로그인 처리 중입니다. 잠시만 기다려주세요...</h2>
        </div>
    )
}