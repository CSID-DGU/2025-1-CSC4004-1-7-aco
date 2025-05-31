import API from "./API";

// 환자 등록
export const registerPatient = async (patientCode) => {
    const response = await API.post(`/medical/${patientCode}`);
    return response.data;
};

// 환자 리스트 정보 가져오기
export const getPatientsInfo = async () => {
    const response = await API.get("/medical/patients");
    return response.data;
};

// 환자 삭제
export const deletePatient = async (medicId) => {
    const respone = await API.delete(`/medical/${medicId}`);
    return respone.data;
};

// 선택한 환자 상세 정보 가져오기
export const getPatientInfo = async (patientCode) => {
    const response = await API.get(`/medical/${patientCode}`);
    return response.data;
};

// 일주일 분석 결과 가져오기
export const getWeeklyData = async (patientCode, baseDate) => {
    const response = await API.get('/diary/analysis/weekly', {
        params: { patientCode, baseDate }
      });
    return response.data;
};

// 환자가 해당 일자에 작성한 일기 가져오기
export const getPatientDiary = async (patientCode) => {
    const response = await API.get(`/diary/${patientCode}`);
    return response.data;
};