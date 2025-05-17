// src/api/authMock.js

export const mockLogin = ({ email, password }) => {
    const mockUsers = [
        { email: 'test@naver.com', password: '1234', name: '홍길동' },
        { email: 'doctor@hospital.com', password: 'abcd', name: '의사쌤' },
        { email: 'hong@example.com', password: '1234', name: '홍'}
    ];

    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
        return Promise.resolve({
            status: 200,
            data: {
                message: '로그인 성공',
                user: { name: user.name, email: user.email }
            }
        });
    } else {
        return Promise.reject({
            status: 401,
            data: { message: '이메일 또는 비밀번호가 올바르지 않습니다' }
        });
    }
};
