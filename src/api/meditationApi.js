import API from './API';

// 전체 명상 목록 조회
export const getAllMeditations = async () => {
    const response = await API.get('/meditation');
    console.log('[getAllMeditations] response:', response);
    return response.data;
};

// 특정 명상 조회
export const getMeditationById = async (meditationId) => {
    const response = await API.get(`/meditation/${meditationId}`);
    console.log('[getMeditationById] response:', response);
    return response.data;
}; 