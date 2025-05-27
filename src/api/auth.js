import API from './API';

export const signIn = async (id, password) => {
    const response = await API.post('/user/login', {
        loginId: id,
        password: password,
    });
    return response.data;
};

export const signUpDoctor = async (formData) => {
    const response = await API.post('/user/signup', formData, {
        headers: {
            'Content-Type': "multipart/form-data",
        }
    });
    return response.data;
};

export const signUpPatient = async (formData) => {
    const response = await API.post('/user/singup', formData, {
        headers: {
            'Content-Type': "multipart/form-data",
        }
    });
    return response.data;
};