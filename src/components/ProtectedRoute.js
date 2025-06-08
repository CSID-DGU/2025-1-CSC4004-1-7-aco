import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // 쿠키에서 토큰 확인
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const token = getCookie('accessToken');
    
    if (!token) {
        alert('로그인이 필요한 서비스입니다.');
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute; 