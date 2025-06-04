import API from "./API";

// 환자 등록
export const registerPatient = async (patientCode) => {
    const response = await API.post(`/medical/patient/${patientCode}`);
    return response.data;
};

// 등록된 환자 리스트 정보 가져오기
export const getPatientsInfo = async () => {
    const response = await API.get("/medical/patients");
    return response.data;
};

// 환자 삭제
export const deletePatient = async (patientCode) => {
    const respone = await API.delete(`/medical/patient/${patientCode}`);
    return respone.data;
};

// 선택한 환자 상세 정보 가져오기
export const getPatientInfo = async (patientCode) => {
    const response = await API.get(`/medical/patient/${patientCode}`);
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
export const getPatientDiary = async (patientCode, date) => {
    const response = await API.get(`/medical/diary/${patientCode}`, {
        params: { date }
    });
    return response.data;
};

// 특정 날짜 그림 조회
export const getPaintByDate = async (patientCode, date) => {
    const response = await API.get(`/medical/paint/${patientCode}`, {
        params: { date }
    });
    return response.data;
}; 

// 특정 그림에 대한 채팅 내용 가져오기
export const getChatList = async (paintId) => {
    const response = await API.get(`/paint/${paintId}/chats`);
    return response.data;
};