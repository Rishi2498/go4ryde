import axios from "axios";
import api from "../utils/axiosInstance";
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/accounts/",
});

// ---------------- TOKEN INTERCEPTOR ----------------

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- AUTO REFRESH TOKEN ----------------

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem("refresh_token");

        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const newAccess =
          response.data.access;

        localStorage.setItem(
          "access_token",
          newAccess
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccess}`;

        return API(originalRequest);

      } catch (err) {

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        localStorage.removeItem(
          "user"
        );

        window.location = "/login";

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// ---------------- AUTH APIs ----------------

// Send OTP
export const sendOTP = (
  email,
  mode
) =>
  api.post(
    "/accounts/send-otp/",
    {
      email,
      mode
    }
  );

// =====================================
// REGISTER
// =====================================
export const register = (data) =>
  api.post(
    "/accounts/register/",
    data
  );

// =====================================
// LOGIN
// =====================================
export const login = (data) =>
  api.post(
    "/accounts/login/",
    data
  );
// Logout
export const logout = (refresh) =>
  API.post("logout/", { refresh });
//
// ---------------- DRIVER APIs ----------------
//
export const upgradeToDriver = (formData) =>
  API.post(
    "driver-upgrade/",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

// ---------------- PROFILE APIs ----------------
//
export const getProfile = () =>
  API.get("profile/");
//
export const getProfileStatus = () =>
  API.get("profile-status/");

export default API;