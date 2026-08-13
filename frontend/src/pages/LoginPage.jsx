// src/pages/LoginPage.jsx
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Activity } from 'lucide-react';
import '../styles/LoginPage.css';



export default function LoginPage() {
    // 백엔드 OAuth2 소셜 로그인 요청 주소 (Spring Security 표준 경로)
    const GOOGLE_LOGIN_URL = 'http://localhost:8080/oauth2/authorization/google';
    const NAVER_LOGIN_URL = 'http://localhost:8080/oauth2/authorization/naver';

    const handleGoogleLogin = () => {
        window.location.href = GOOGLE_LOGIN_URL;
    };

    const handleNaverLogin = () => {
        window.location.href = NAVER_LOGIN_URL;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <Activity size={44} color="var(--primary)" />
                    <h1 className="login-title">Running Coach</h1>
                    <p className="login-subtitle">소셜 계정으로 간편하게 시작하세요</p>
                </div>
                <div className="social-login-group">
                    {/* 구글 로그인 버튼 */}
                    <button onClick={handleGoogleLogin} className="social-btn google-btn">
                    <FcGoogle size={22}/>
                    Google 계정으로 로그인
                    </button>
                    {/* 네이버 로그인 버튼 */}
                    <div onClick={handleNaverLogin} className='naver-img-btn-wrapper'>
                        <img
                            src="/naver_btn.png"
                            alt='네이버 아이디로 로그인'
                            className='naver-img-btn'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}