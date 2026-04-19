import api from "../utils/axiosInstance";

export const applyCoupon = (data) => {
    return api.post("/coupons/apply/", data);
};