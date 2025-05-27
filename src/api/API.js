import axios from 'axios';

const API = axios.create({
    baseURL: 'http://3.36.51.34:8080/api',
    withCredentials: true,
});

// 토큰 추가
API.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    console.log("API.js | accessToken: ", accessToken);
    console.log("API.js | refreshToken: ", refreshToken);
    
    // 토큰 있으면 헤더에 토큰 추가
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log("Authorization header set:", config.headers.Authorization);
    } else {
        console.warn("No token found, Authorization header not set.");
    }

    return config;
});

// // 토큰 만료 시
// API.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     // 401 또는 403 에러 발생 시에만 토큰 재발급 시도
//     if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         if (!refreshToken) throw new Error("No refresh token available");

//         // refresh token으로 access token 재발급 요청
//         const response = await axios.post('http://3.36.51.34:8080/api/user/refresh-token', null, {
//           headers: {
//             Authorization: `Bearer ${refreshToken}`
//           }
//         });

//         const newAccessToken = response.data.accessToken;
//         localStorage.setItem("accessToken", newAccessToken);

//         // 기존 요청에 새로운 토큰 적용
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//         // 원래 요청 다시 실행
//         return API(originalRequest);
//       } catch (refreshError) {
//         // 재발급 실패 시 로그아웃 처리
//         localStorage.removeItem("accessToken");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/signin"; // 로그인 페이지로 리다이렉트
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default API;