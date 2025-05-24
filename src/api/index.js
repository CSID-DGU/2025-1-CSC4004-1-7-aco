import axios from "axios";

const apiClient = axios.create({
    // URL 확인
    baseURL: "http://localhost:8084/api",
    headers: {"Content-Type":"application/json"},
    timeout: 5000,
})

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    // 토큰 있으면 요청 시 헤더에 토큰 추가
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use((response) => 
    response, (error) => {
        if (error.response && error.response.status === 401) {
            alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem("token");
            window.location.href="/signin";
        }
        return Promise.reject(error);
    }
);

export default apiClient;