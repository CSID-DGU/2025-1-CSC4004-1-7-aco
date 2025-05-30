import API from "./API";

export const registerPatient = async (patientCode) => {
    const response = await API.post(`/medical/${patientCode}`);
    return response.data;
};

export const getPatient = async () => {
    const response = await API.get("/medical/patients");
    return response.data;
};

export const deletePatient = async (medicId) => {
    const respone = await API.delete(`/medical/${medicId}`);
    return respone.data;
}