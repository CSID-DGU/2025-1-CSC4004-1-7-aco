import API from './API';

export const doctorApi = {
  // 환자 목록 조회
  getPatients: async () => {
    const response = await API.get(`/medical/doctor/patients`);
    return response.data;
  },

  // 환자 상세 정보 조회
  getPatientDetail: async (patientCode) => {
    try {
      const response = await API.get(`/medical/patient/${patientCode}`);
      return response.data;
    } catch (error) {
      console.error('환자 상세 정보 조회 실패:', error);
      throw error;
    }
  },

  // 환자 등록
  addPatient: async (patientCode) => {
    const response = await API.post(`/medical/doctor/patient/${patientCode}`);
    return response.data;
  },

  // 환자 삭제
  removePatient: async (medicId) => {
    try {
      await API.delete(`/medical/${medicId}`);
    } catch (error) {
      console.error('환자 삭제 실패:', error);
      throw error;
    }
  }
}; 