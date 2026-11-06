import {apiRequest} from './api';

export const createBooking = async ({
  rideId,
  seats,
  couponCode = '',
}) => {
  return apiRequest('/bookings/create/', {
    method: 'POST',
    body: JSON.stringify({
      ride: Number(rideId),
      seats: Number(seats),
      coupon_code: couponCode,
    }),
  });
};

export const getMyBookings = async () => {
  return apiRequest('/bookings/my-bookings/', {
    method: 'GET',
  });
};

export const getBookingDetails = async bookingId => {
  return apiRequest(`/bookings/${bookingId}/`, {
    method: 'GET',
  });
};

export const cancelBooking = async bookingId => {
  return apiRequest(
    `/bookings/cancel/${bookingId}/`,
    {
      method: 'POST',
    },
  );
};

export default {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
};