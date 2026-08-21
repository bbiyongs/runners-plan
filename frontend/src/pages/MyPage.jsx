import React, { useState, useEffect } from "react";
import Sidebar from '@/components/layout/Sidebar';
import GarminConnectModal from "@/components/dashboard/GarminConnectModal";
import { garminApi } from "@/api/garminApi";
import { ShieldCheck, RefreshCw, Link as LinkIcon, User } from "lucide-react";
import '@/styles/MyPage.css';
import { useAuth } from '@/context/AuthContext';

export default function MyPage() {
    const { token } = useAuth();

    // 메모리 jwt 토큰에서 runnerId 추출
    const getRunnerId = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.runnerId || payload.sub || null;
        } catch {
            return null;
        }
    }

    const currentRunnerId = getRunnerId();

    // JWT 토큰에서 runnerId 추출
    const getStoredUser = () => {
        try{
            const rawUser = localStorage.getItem('user');
            if (!rawUser) return {};
            if (typeof rawUser === 'object') return rawUser;
            return JSON.parse(rawUser);
        } catch(e) {
            console.warn("user 로컬 스토리지 파싱 오류 : ", e);
            return {};
        }
    }

    const storedUser = getStoredUser();
    const runnerId = currentRunnerId || storedUser.runner_id || storedUser.id;

    const [isGarminModalOpen, setIsGarminModalOpen] = useState(false);
    const [garminStatus, setGarminStatus] = useState({
        is_connected: false,
        garmin_email: null,
        initial_sync_completed: false,
        last_synced_at: null,
    });
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        if (!runnerId) {
            // alert('사용자 정보를 찾을수 없습니다. 다시 로그인해주세요. ');
            // localStorage.removeItem('accessToken');
            // window.location.href = '/';
            // return;
            console.warn('runnerId 를 찾을 수 없습니다.');
            return;
        }
        try {
            setLoading(true);
            const data = await garminApi.getStatus(runnerId);
            setGarminStatus(data);
        } catch (err) {
            console.error('garmin 상태 로드 실패 : ', err);
            setGarminStatus({ is_connected: false, garmin_email: null, initial_sync_completed: false, last_synced_at: null });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [runnerId]);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <header className="mypage-header">
                    <div>
                        <h1 className="dashboard-title">마이페이지</h1>
                        <p className="dashboard-subtitle">계정 설정 및 외부 스마트 워치 연동을 관리합니다</p>
                    </div>
                </header>
                <div className="mypage-content-grid">
                    {/* 프로필 요약 카드 */}
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <User size={36} color="#2e7d32" />
                        </div>
                        <div className="profile-info">
                            <h2>러너 프로필</h2>
                            <p>러닝 계정 ID: #{runnerId}</p>
                        </div>
                    </div>
                    {/* Garmin 연동 관리 카드 */}
                    <div className="garmin-integration-card">
                        <div className="card-header">
                            <div className="title-with-badge">
                                <span className="garmin-tag">GARMIN CONNECT</span>
                                <h3>Garmin 스마트워치 연동</h3>
                            </div>
                            <span className={`status-pill ${garminStatus.is_connected ? 'connected' : 'disconnected'}`}>
                                {garminStatus.is_connected ? '연동 완료' : '미연동'}
                            </span>
                        </div>
                        <p className="card-desc">
                            Garmin Connect 계정을 연동하면 러닝 시 자동 수집되는 정밀 분석 지표(훈련 효과, 케이던스, 랩 타임)를 손쉽게 가져올 수 있습니다.
                        </p>
                        {loading ? (
                            <div>연동 상태를 확인하는 중입니다...</div>
                        ) : garminStatus.is_connected ? (
                            <div className="connected-details">
                                <div className="detail-row">
                                    <span>연동 계정:</span>
                                    <strong>{garminStatus.garmin_email}</strong>
                                </div>
                                <div className="detail-row">
                                    <span>최근 동기화 시각:</span>
                                    <strong>
                                        {garminStatus.last_synced_at
                                            ? new Date(garminStatus.last_synced_at).toLocaleString()
                                            : '동기화 기록 없음'}
                                    </strong>
                                </div>
                                <button className="btn-manage-garmin" onClick={() => setIsGarminModalOpen(true)}>
                                    <RefreshCw size={16} /> Garmin 연동 관리 & 전체 동기화
                                </button>
                            </div>
                        ) : (
                            <div className="disconnected-action">
                                <button className="btn-connect-garmin" onClick={() => setIsGarminModalOpen(true)}>
                                    <LinkIcon size={16} /> Garmin 계정 연동하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Garmin 계정 연동 모달 */}
                <GarminConnectModal
                    isOpen={isGarminModalOpen}
                    onClose={() => setIsGarminModalOpen(false)}
                    runnerId={runnerId}
                    onSyncSuccess={fetchStatus}
                />
            </main>
        </div>
    );
}