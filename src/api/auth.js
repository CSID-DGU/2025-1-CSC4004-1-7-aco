import axios from 'axios';

export const signIn = async (id, password) => {
    const response = await axios.post('/user/login', {
        loginId: id,
        password: password,
    });
    return response.data;
};

export const signUpDoctor = async (formData) => {
    const response = await axios.post('/user/singup', formData, {
        headers: {
            'Content-Type': "multipart/form-data",
        }
    });
    return response.data;
};

export const signUpPatient = async (formData) => {
    const response = await axios.post('/user/singup', formData, {
        headers: {
            'Content-Type': "multipart/form-data",
        }
    });
    return response.data;
};