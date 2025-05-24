import apiClient from "./index";

export const login = (email, password) => {
    return apiClient.post("/user/signin", {email, password});
};