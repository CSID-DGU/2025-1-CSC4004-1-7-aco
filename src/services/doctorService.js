import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

let mockPatients = [
  {
    patientCode: "PX8321",
    name: "이환자",
    birthDate: "2000-05-10"
  }
];

export const doctorService = {
  // 환자 목록 조회
  getPatients: async (licenseNumber) => {
    return mockPatients;
  },

  // 환자 상세 정보 조회
  getPatientDetail: async (patientCode) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/medical/patient/${patientCode}`);
      return response.data;
    } catch (error) {
      console.error('환자 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  // 환자 등록
  addPatient: async (licenseNumber, patientCode) => {
    // 이미 있으면 추가하지 않음
    if (!mockPatients.find(p => p.patientCode === patientCode)) {
      mockPatients.push({
        patientCode,
        name: "새환자", // 임의 이름
        birthDate: "2000-01-01"
      });
    }
    return { message: "환자 추가 성공", patientCode, licenseNumber };
  },

  // 환자 삭제
  removePatient: async (medicId) => {
    try {
      await axios.delete(`${API_BASE_URL}/medical/${medicId}`);
    } catch (error) {
      console.error('환자 삭제 실패:', error);
      throw error;
    }
  }
}; 