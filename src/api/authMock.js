const mockUsers = [
    {
        email: "test@test.com",
        password: "1234",
        name: "fender",
    },
    {
        email: "abc@gmail.com",
        password: "aaaa",
        name: "dame",
    },
    {
        email: "qwer@naver.com",
        password: "qwer",
        name: "fodera",
    },
]

export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
        const user = mockUsers.find(
            (u) => u.email===email && u.password === password
        );

      if (user) {
        resolve({
          data: {
            token: "mock-token-1234",
            user: {
              name: user.name,
              email: user.email,
            },
          },
        });
      } else {
        reject({
          response: {
            data: {
              message: "이메일 또는 비밀번호가 틀렸습니다.",
            },
          },
        });
      }
    }, 500); // 응답 지연 시뮬레이션
  });
};
