import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Activity, LogOut } from "lucide-react";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('로그아웃 되었습니다.');
        navigate('/');
    };

    const navItems = [
        { label: '📊 대시보드', path: '/dashboard' },
        { label: '🏃 러닝 기록', path: '/runs' },
        { label: '📈 통계 분석', path: '/stats' },
        { label: '👤 마이페이지', path: '/profile' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Activity color="#6366f1" size={28} />
                <h2 className="sidebar-logo-text">Running Coach</h2>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <div key={item.path}
                        className={`sidebar-item ${location.pathname === item.path ? 'active':''}`}
                        onClick={()=> navigate(item.path)}
                        >
                        {item.label}
                    </div>
                ))}
            </nav>

            <button onClick={handleLogout} className="logout-button">
                <LogOut size={18}/>로그아웃
            </button>
        </aside>
    );
}