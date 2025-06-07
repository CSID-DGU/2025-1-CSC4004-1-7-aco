import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // 쿠키에서 토큰 확인
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    
    if (!tokenCookie) {
        alert('로그인이 필요한 서비스입니다.');
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute; 