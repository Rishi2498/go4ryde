import {apiRequest} from './api';

// =====================================================
// GET CHAT MESSAGES
// =====================================================

export const getChatMessages = async bookingId => {
  console.log('💬 GET CHAT MESSAGES:', bookingId);

  return apiRequest(`/chat/${bookingId}/`, {
    method: 'GET',
  });
};


// =====================================================
// SEND CHAT MESSAGE
// =====================================================

export const sendChatMessage = async (bookingId, message) => {
  const data = {
    message: message.trim(),
  };

  console.log('💬 SEND CHAT MESSAGE:', {
    bookingId,
    message: data.message,
  });

  return apiRequest(`/chat/send/${bookingId}/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};


// =====================================================
// MARK CHAT AS READ
// =====================================================

export const markChatRead = async bookingId => {
  console.log('👁️ MARK CHAT READ:', bookingId);

  return apiRequest(`/chat/read/${bookingId}/`, {
    method: 'POST',
  });
};


export default {
  getChatMessages,
  sendChatMessage,
  markChatRead,
};