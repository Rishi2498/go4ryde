import {apiRequest} from './api';

// =====================================================
// CREATE BOOKING PAYMENT
// Supports:
// FULL
// PARTIAL
// WALLET
// COD
// =====================================================

export const createBookingPayment = async ({
  bookingId,
  paymentType = 'FULL',
  amount = null,
}) => {
  const data = {
    booking_id: Number(bookingId),
    payment_type: paymentType,
  };

  // Send amount for payment methods that need it
  if (
    paymentType === 'FULL' ||
    paymentType === 'PARTIAL'
  ) {
    if (amount !== null && amount !== undefined) {
      data.amount = Number(amount);
    }
  }

  console.log('💳 CREATE BOOKING PAYMENT:', data);

  return apiRequest('/payments/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// =====================================================
// VERIFY RAZORPAY BOOKING PAYMENT
// Used for:
// FULL
// PARTIAL
// =====================================================

export const verifyBookingPayment = async ({
  orderId,
  paymentId,
  signature,
}) => {
  console.log('🔐 VERIFY BOOKING PAYMENT:', {
    orderId,
    paymentId,
  });

  return apiRequest('/payments/verify/', {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      payment_id: paymentId,
      signature,
    }),
  });
};


// =====================================================
// FULL PAYMENT
// =====================================================

export const payFullBooking = async (
  bookingId,
  amount,
) =>
  createBookingPayment({
    bookingId,
    paymentType: 'FULL',
    amount,
  });


// =====================================================
// PARTIAL PAYMENT
// =====================================================

export const payPartialBooking = async (
  bookingId,
  amount,
) => {
  return createBookingPayment({
    bookingId,
    paymentType: 'PARTIAL',
    amount,
  });
};


// =====================================================
// WALLET PAYMENT
// =====================================================

export const payBookingFromWallet = async bookingId => {
  return createBookingPayment({
    bookingId,
    paymentType: 'WALLET',
  });
};


// =====================================================
// CASH / COD PAYMENT
// =====================================================

export const payBookingByCash = async bookingId => {
  return createBookingPayment({
    bookingId,
    paymentType: 'COD',
  });
};


export default {
  createBookingPayment,
  verifyBookingPayment,

  payFullBooking,
  payPartialBooking,
  payBookingFromWallet,
  payBookingByCash,
};