import axios from 'axios';

const API = axios.create({
    baseURL: 'https://www.maeumnaru.shop/api',
    withCredentials: true,
});

export default API;