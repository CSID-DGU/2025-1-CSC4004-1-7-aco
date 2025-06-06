import axios from 'axios';

const API = axios.create({
    baseURL: 'https://www.maeumnaru.shop/api',
    withCredentials: true,
});

// 모든 요청(request) 로그
API.interceptors.request.use(config => {
    console.log('[API 요청]', config.method?.toUpperCase(), config.url);
    console.log('[API 요청 전체 config]', config);
    return config;
});

// 모든 응답(response) 로그
API.interceptors.response.use(response => {
    console.log('[API 응답]', response.config.url, response);
    return response;
}, error => {
    console.error('[API 에러]', error.config?.url, error);
    return Promise.reject(error);
});

export default API;