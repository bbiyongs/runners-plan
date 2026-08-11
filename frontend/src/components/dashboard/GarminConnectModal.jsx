import React, { useState, useEffect } from "react";
import { useGarminConnect } from "../../hooks/useGarminConnect";
import { garminApi } from "../../api/garminApi";
import '../../styles/GarminConnectModal.css';

export default function GarminConnectModal({ isOpen, onClose, runnerId = 1, onSyncSuccess }) {
    const {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        syncingInitial,
        statusInfo,
        errorMessage,
        successMessage,
        handleConnectSubmit,
        handleInitialSync,
    } = useGarminConnect(isOpen, runnerId, onSyncSuccess);

    if (!isOpen) return null;

    return (
        <div className="garmin-modal-backdrop" onClick={onClose}>
            <div className="garmin-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="garmin-modal-header">
                    <div className="garmin-title-group">
                        <span className="garmin-badge">GARMIN CONNECT</span>
                        <h2>가민 계정 연동 및 데이터 동기화</h2>
                    </div>
                    <button className="garmin-modal-close" onClick={onClose}>✕</button>
                </div>
                {errorMessage && (
                    <div className="garmin-alert error">
                        <span>⚠️ {errorMessage}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="garmin-alert success">
                        <span>✅ {successMessage}</span>
                    </div>
                )}
                {/* 연동 상태 표시 카트 */}
                <div className="garmin-status-card">
                    <div className="status-indicator-wrap">
                        <div className={`status-dot ${statusInfo.is_connected ? 'active' : 'inactive'}`} />
                        <div>
                            <span className="status-label">연동 상태</span>
                            <h4 className="status-text">
                                {statusInfo.is_connected ? '가민 계정 연동 완료' : '계정 미연동 상태'}
                            </h4>
                        </div>
                    </div>
                    {statusInfo.is_connected && (
                        <div className="status-meta">
                            <div className="meta-item">
                                <span className="meta-title">연동 이메일</span>
                                <span className="meta-value">{statusInfo.garmin_email}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-title">최근 동기화 시각</span>
                                <span className="meta-value">
                                    {statusInfo.last_synced_at
                                        ? new Date(statusInfo.last_synced_at).toLocaleString()
                                        : '동기화 이력 없음'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                {/* 계정 연동 입력 폼 */}
                <form onSubmit={handleConnectSubmit} className="garmin-connect-form">
                    <h3>{statusInfo.is_connected ? '계정 정보 재설정 / 인증 갱신' : '가민 계정 정보 입력'}</h3>
                    <div className="form-group">
                        <label>Garmin Connect 이메일</label>
                        <input
                            type="email"
                            placeholder="example@garmin.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading || syncingInitial}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Garmin Connect 비밀번호</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading || syncingInitial}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-garmin-connect"
                        disabled={loading || syncingInitial}
                    >
                        {loading ? '가민 인증 처리 중...' : statusInfo.is_connected ? '계정 재연동 (인증 갱신)' : 'Garmin 계정 연동하기'}
                    </button>
                </form>
                {/* 과거 전체 동기화 버튼 (연동 완료 시) */}
                {statusInfo.is_connected && (
                    <div className="garmin-sync-actions">
                        <div className="sync-info-box">
                            <h4>과거 전체 기록 가져오기 (Full Sync)</h4>
                            <p>
                                Garmin에 기록된 과거 러닝 데이터 전체를 가져옵니다.<br />
                                수동 입력 기록은 가민 데이터로 자동 교체됩니다.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-garmin-initial-sync"
                            onClick={handleInitialSync}
                            disabled={syncingInitial || loading}
                        >
                            {syncingInitial ? '과거 전체 기록 가져오는 중... ⏳' : '과거 기록 전체 가져오기'}
                        </button>
                    </div>
                )}
                <div className="garmin-modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={loading || syncingInitial}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}