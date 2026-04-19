import api from "../utils/axiosInstance";

// 🚀 CREATE PAYMENT
export const createPayment = (data) => {
    return api.post("/payments/create/", data);
};

// 🚀 VERIFY PAYMENT
export const verifyPayment = (data) => {
    return api.post("/payments/verify/", data);
};