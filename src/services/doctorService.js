import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const doctorService = {
  // 환자 목록 조회
  getPatients: async (licenseNumber) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/medical/doctor/${licenseNumber}/patients`);
      return response.data;
    } catch (error) {
      console.error('환자 목록 조회 실패:', error);
      throw error;
    }
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
    try {
      const response = await axios.post(`${API_BASE_URL}/medical/doctor/${licenseNumber}/patient/${patientCode}`);
      return response.data;
    } catch (error) {
      console.error('환자 등록 실패:', error);
      throw error;
    }
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