import API from './API';

export const getUserInfo = async () => {
    const response = await API.get('/user/me');

    console.log("getUserInfo");
    console.log("response: ", response);

    return response.data;
};

export const updateUserInfo = async (email, password, phone, hospital) => {
    const response = await API.put('/user/me', {
        email: email,
        password: password,
        phone: phone,
        hospital: hospital,
    });
    return response.data;
};

