// src/pages/LoginPage.jsx
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import '@/styles/LoginPage.css';

export default function LoginPage() {
    // 백엔드 OAuth2 소셜 로그인 요청 주소 (Spring Security 표준 경로)
    const BASE = import.meta.env.VITE_SPRING_API_URL?.replace('/api', '') || 'http://localhost:8080';
    const GOOGLE_LOGIN_URL = `${BASE}/oauth2/authorization/google`;
    const NAVER_LOGIN_URL = `${BASE}/oauth2/authorization/naver`;

    const handleGoogleLogin = () => {
        window.location.href = GOOGLE_LOGIN_URL;
    };

    const handleNaverLogin = () => {
        window.location.href = NAVER_LOGIN_URL;
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="turtle-badge-wrapper">
                        <span className="turtle-emoji">🐢</span>
                    </div>
                    <h1 className="login-title">거북이 러너</h1>
                    <p className="login-motto">Slow & Steady, Injury-Free</p>
                    <p className="login-subtitle">
                        기록보다 건강하게, 천천히 오래 꾸준히 달리는<br />
                        슬로우 러너들의 스마트 코치
                    </p>
                </div>

                <div className="slow-runner-banner">
                    <div className="banner-item">
                        <ShieldCheck size={16} className="banner-icon" />
                        <span>부상 없는 안전 러닝</span>
                    </div>
                    <div className="banner-item">
                        <HeartPulse size={16} className="banner-icon" />
                        <span>Zone 2 심박수 케어</span>
                    </div>
                    <div className="banner-item">
                        <Sparkles size={16} className="banner-icon" />
                        <span>컨디션 맞춤 코칭</span>
                    </div>
                </div>

                <div className="social-login-group">
                    {/* 구글 로그인 버튼 */}
                    <button onClick={handleGoogleLogin} className="social-btn google-btn">
                        <FcGoogle size={22}/>
                        <span>Google 계정으로 시작하기</span>
                    </button>
                    {/* 네이버 로그인 버튼 */}
                    <button type="button" onClick={handleNaverLogin} className='naver-img-btn-wrapper'>
                        <img
                            src="/naver_btn.png"
                            alt='네이버 아이디로 로그인'
                            className='naver-img-btn'
                        />
                    </button>
                </div>

                <div className="login-footer">
                    <span>🐢 "천천히 달릴 때 비로소 달리는 즐거움이 보입니다"</span>
                </div>
            </div>
        </div>
    );
}