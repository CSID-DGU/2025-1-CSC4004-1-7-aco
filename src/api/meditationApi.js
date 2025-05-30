import axios from 'axios';

const BASE_URL = 'https://www.maeumnaru.shop/api';

// 전체 명상 목록 조회
export const getAllMeditations = async () => {
    const response = await axios.get(`${BASE_URL}/meditation`);
    console.log('[getAllMeditations] response:', response);
    return response.data;
};

// 특정 명상 조회
export const getMeditationById = async (meditationId) => {
    const response = await axios.get(`${BASE_URL}/meditation/${meditationId}`);
    console.log('[getMeditationById] response:', response);
    return response.data;
}; 