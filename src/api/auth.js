import API from './API';

export const signIn = async (id, password) => {
    const response = await API.post('/user/login', {
        loginId: id,
        password: password,
    });
    console.log('[signIn] response:', response);
    return response.data;
};

export const signUpDoctor = async (formData) => {
    const response = await API.post('/user/signup', formData, {
        headers: {
            'Content-Type': "multipart/form-data",
        }
    });
    console.log('[signUpDoctor] response:', response);
    return response.data;
};

export const signUpPatient = async (formData) => {
    const response = await API.post('/user/signup', formData, {
        headers: {
            'Content-Type': "multipart/form-data",
        }
    });
    console.log('[signUpPatient] response:', response);
    return response.data;
};

export const signOut = async () => {
    const response = await API.post('/user/logout');
    console.log('[signOut] response:', response);
    return response.data;
};

export const deleteUser = async () => {
    const response = await API.delete('/user/me');
    console.log('[deleteUser] response:', response);
    return response.data;
};