import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="nav-bar">
            <span className="welcome-msg">OOO님 환영합니다!</span>
            <div className="nav-menu">
                <button
                    className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/')}
                >
                    일기 작성
                </button>
                <button
                    className={`nav-btn ${location.pathname === '/drawing' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/drawing')}
                >
                    그림 그리기
                </button>
                <button className="nav-btn">명상</button>
            </div>
            <button className="profile-btn">
                {/* 프로필 아이콘 (svg 또는 이미지) */}
                <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="12" r="7" stroke="#0089ED" strokeWidth="2" fill="none" />
                    <ellipse cx="16" cy="25" rx="10" ry="6" stroke="#0089ED" strokeWidth="2" fill="none" />
                </svg>
            </button>
        </div>
    );
}

export default Navigation;