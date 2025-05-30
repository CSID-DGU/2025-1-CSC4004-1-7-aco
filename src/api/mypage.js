import API from './API';

export const getUserInfo = async () => {
    const response = await API.get('/user/me');
    console.log('[getUserInfo] response:', response);
    return response.data;
};

export const updateUserInfo = async (email, password, phone, hospital) => {
    const response = await API.put('/user/me', {
        email: email,
        password: password,
        phone: phone,
        hospital: hospital,
    });
    console.log('[updateUserInfo] response:', response);
    return response.data;
};

