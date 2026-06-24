import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});

API.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

// ========================================
// 🚗 START RIDE
// ========================================
export const startRide = async (
    bookingId
) => {

    const res = await API.post(
        `/bookings/start/${bookingId}/`
    );

    return res.data;
};

// ========================================
// 🏁 END RIDE
// ========================================
export const endRide = async (
    bookingId
) => {

    const res = await API.post(
        `/bookings/end-ride/${bookingId}/`
    );

    return res.data;
};

API.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest =
            error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            try {
                const refresh =
                    localStorage.getItem(
                        "refresh_token"
                    );

                const res =
                    await axios.post(
                        "http://127.0.0.1:8000/api/token/refresh/",
                        {
                            refresh
                        }
                    );

                localStorage.setItem(
                    "access_token",
                    res.data.access
                );

                originalRequest.headers.Authorization =
                    `Bearer ${res.data.access}`;

                return API(originalRequest);

            } catch {
                localStorage.clear();
                window.location = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default API;