import axios from 'axios';

const API = axios.create({
    BASE_URL: 'http://localhost:8080/api',
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    
    // 토큰 있으면 헤더에 토큰 추가
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;