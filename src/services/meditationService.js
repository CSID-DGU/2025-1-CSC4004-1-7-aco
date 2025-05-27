import axios from 'axios';

// 전체 명상 리스트 조회
export const getAllMeditations = async () => {
  const response = await axios.get('http://localhost:8080/api/meditation');
  return response.data;
};

// 특정 명상 상세 조회
export const getMeditationById = async (id) => {
  const response = await axios.get(`http://localhost:8080/api/meditation/${id}`);
  return response.data;
}; 