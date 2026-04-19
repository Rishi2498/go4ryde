import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/accounts/", // ✅ corrected endpoint
});

// ---------------- TOKEN INTERCEPTOR ----------------

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  const publicEndpoints = ["send-otp", "register", "login"];
  const isPublic = publicEndpoints.some((url) =>
    config.url.includes(url)
  );
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- AUTH APIs ----------------

// 🔹 Send OTP (for both register & login)
export const sendOTP = (email) =>
  API.post("send-otp/", { email });


// 🔹 Register (email + phone + otp)
export const register = (data) =>
  API.post("register/", data);


// 🔹 Login (email + otp)
export const login = (data) =>
  API.post("login/", data);


// 🔹 Logout (blacklist refresh token)
export const logout = (refresh) =>
  API.post("logout/", { refresh });


// ---------------- DRIVER APIs ----------------

// 🔹 Upgrade to driver (multipart form)
export const upgradeToDriver = (formData) =>
  API.post("driver-upgrade/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


// ---------------- OPTIONAL (FUTURE USE) ----------------

// 🔹 Get current user profile (if you add API later)
export const getProfile = () =>
  API.get("profile/");

// 🔹 Get role/status (optional endpoint)
export const getProfileStatus = () =>
  API.get("profile-status/");