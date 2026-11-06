import {apiRequest} from './api';

// ==========================================
// SEND OTP
// ==========================================

export const sendOTP = async (email, mode) => {
  return apiRequest('/accounts/send-otp/', {
    method: 'POST',

    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      mode,
    }),
  });
};

// ==========================================
// REGISTER
// ==========================================

export const registerUser = async ({
  username,
  email,
  phone,
  otp,
}) => {
  return apiRequest('/accounts/register/', {
    method: 'POST',

    body: JSON.stringify({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      otp: otp.trim(),
    }),
  });
};

// ==========================================
// LOGIN
// ==========================================

export const loginUser = async ({
  email,
  otp,
}) => {
  return apiRequest('/accounts/login/', {
    method: 'POST',

    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    }),
  });
};

// ==========================================
// GET PROFILE
// ==========================================

export const getProfile = async () => {
  return apiRequest('/accounts/profile/', {
    method: 'GET',
  });
};