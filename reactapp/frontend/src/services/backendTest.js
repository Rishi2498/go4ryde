import {apiRequest} from './api';

// export const testBackend = async () => {
//   return apiRequest('/accounts/send-otp/', {
//     method: 'POST',
//     body: JSON.stringify({
//       email: 'test@example.com',
//       mode: 'login',
//     }),
//   });
// };

export const testBackend = async () => {
  return apiRequest('/accounts/profile/', {
    method: 'GET',
  });
};
