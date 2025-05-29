import API from './API';
import axios from 'axios';

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
    const response = await API.post('/user/signup', formData, {
        headers: {
            'Content-Type': "multipart/form-data",
        }
    });
    return response.data;
};

export const signOut = async () => {
    const response = await API.post('/user/logout');
    return response.data;
};

export const deleteUser = async () => {
    const response = await API.delete('/user/me');
    return response.data;
};