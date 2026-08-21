import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "@/styles/Dashboard.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { label: '대시보드', path: '/dashboard' },
        { label: '러닝 기록', path: '/runs' },
        { label: '통계 분석', path: '/stats' },
        { label: '러닝화 관리', path: '/shoes' },
        { label: '마이페이지', path: '/profile' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span className="sidebar-turtle-icon">🐢</span>
                <div className="sidebar-logo-text-group">
                    <h2 className="sidebar-logo-text">거북이 러너</h2>
                    <span className="sidebar-logo-sub">SLOW RUNNER</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button key={item.path}
                        type="button"
                        className={`sidebar-item ${location.pathname === item.path ? 'active':''}`}
                        onClick={()=> navigate(item.path)}
                        >
                        {item.label}
                    </button>
                ))}
            </nav>

            <button onClick={handleLogout} className="logout-button">
                <LogOut size={18}/>로그아웃
            </button>
        </aside>
    );
}