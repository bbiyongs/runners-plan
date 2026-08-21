import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Sidebar from '../layout/Sidebar';

export default function ErrorState({
    title = "데이터를 불러올 수 없습니다",
    message = "네트워크 연결을 확인하시거나 잠시 후 다시 시도해 주세요.",
    onRetry,
    redirectUrl = "/dashboard",
    redirectText = "대시보드로 이동",
    showSidebar = true
}) {
    const cardContent = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', width: '100%' }}>
            <div style={{ textAlign: 'center', background: '#ffffff', padding: '40px 30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '420px', width: '100%' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <AlertTriangle size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                    {title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', marginBottom: '24px' }}>
                    {message}
                </p>

                {/* 사용자 액션 버튼 2종 */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '10px 18px', background: '#2e7d32', color: '#ffffff',
                                border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.88rem',
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={16} /> 다시 시도
                        </button>
                    )}
                    <button
                        onClick={() => window.location.href = redirectUrl}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', background: '#f1f5f9', color: '#334155',
                            border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.88rem',
                            cursor: 'pointer'
                        }}
                    >
                        {redirectText}
                    </button>
                </div>
            </div>
        </div>
    );

    if (showSidebar) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="main-content">
                    {cardContent}
                </main>
            </div>
        );
    }

    return cardContent;
}