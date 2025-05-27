import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

// 전체 명상 목록 조회
export const getAllMeditations = async () => {
    const response = await axios.get(`${BASE_URL}/meditation`);
    return response.data;
};

// 특정 명상 조회
export const getMeditationById = async (meditationId) => {
    const response = await axios.get(`${BASE_URL}/meditation/${meditationId}`);
    return response.data;
}; 