import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';

export const login = async ({ email, password }) => {
    const res = await axios.post(`${API_BASE_URL}/user/login`, {
        email,
        password,
    });
    return res;
};