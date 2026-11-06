import {apiRequest} from './api';


// =====================================================
// NORMALIZE RIDE
// =====================================================

const normalizeRide = ride => {

  return {
    id: ride?.id,

    source: ride?.source,
    destination: ride?.destination,

    source_lat: ride?.source_lat,
    source_lng: ride?.source_lng,

    destination_lat:
      ride?.destination_lat,

    destination_lng:
      ride?.destination_lng,

    price_per_seat:
      ride?.price_per_seat,

    distance_km:
      ride?.distance_km,

    duration_min:
      ride?.duration_min,

    seats_total:
      ride?.seats_total,

    seats_remaining:
      ride?.seats_remaining ??
      ride?.available_seats ??
      0,

    driver:
      ride?.driver,

    route_geometry:
      ride?.route_geometry,

    status:
      ride?.status,

    date_time:
      ride?.date_time,
  };
};


// =====================================================
// GET ALL RIDES
// =====================================================

export const getRides = async () => {

  const response =
    await apiRequest(
      '/rides/',
      {
        method: 'GET',
      },
    );


  const rides =
    Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];


  return rides.map(
    normalizeRide,
  );
};


// =====================================================
// CALCULATE ROUTE
// =====================================================

export const calculateRoute = async (
  source,
  destination,
) => {

  return apiRequest(
    '/rides/calculate-route/',
    {
      method: 'POST',

      body: JSON.stringify({
        source,
        destination,
      }),
    },
  );
};


// =====================================================
// CREATE RIDE
// =====================================================

export const createRide = async ride => {

   console.log(
    'CREATING RIDE:',
    ride,
  );

  return apiRequest(
    '/rides/',
    {
      method: 'POST',

      body: JSON.stringify({
        source: ride.source,
        destination: ride.destination,

        source_lat: ride.source_lat,
        source_lng: ride.source_lng,

        destination_lat:
          ride.destination_lat,

        destination_lng:
          ride.destination_lng,

        date_time:
          ride.date_time,

        seats_available:
          Number(ride.seats_available),

        price_per_seat:
          ride.price_per_seat === '' ||
          ride.price_per_seat === null ||
          ride.price_per_seat === undefined
            ? null
            : Number(ride.price_per_seat),
      }),
    },
    
  );
};


// =====================================================
// MY RIDES
// =====================================================
export const getMyRides = async () => {
  console.log('🔥 GET MY RIDES CALLED');

  try {
    const response = await apiRequest('/rides/my_rides/', {
      method: 'GET',
    });

    console.log('🔥 GET MY RIDES RESPONSE:', response);

    const rides = Array.isArray(response)
      ? response
      : Array.isArray(response?.results)
        ? response.results
        : [];

    console.log('🔥 MY RIDES ARRAY:', rides);

    return rides;
  } catch (error) {
    console.log('❌ GET MY RIDES ERROR:', error);
    throw error;
  }
};


// =====================================================
// START RIDE
// =====================================================

export const startRide = async bookingId => {

  return apiRequest(
    `/rides/start/${bookingId}/`,
    {
      method: 'POST',
    },
  );
};


// =====================================================
// END RIDE
// =====================================================

export const endRide = async bookingId => {

  return apiRequest(
    `/rides/end/${bookingId}/`,
    {
      method: 'POST',
    },
  );
};


export default {
  getRides,
  calculateRoute,
  createRide,
  getMyRides,
  startRide,
  endRide,
}; 


// =====================================================
// DRIVER BOOKING ACTIONS
// =====================================================

export const acceptBooking = async bookingId => {
  console.log('✅ ACCEPT BOOKING:', bookingId);

  return apiRequest(`/rides/accept/${bookingId}/`, {
    method: 'POST',
  });
};

export const rejectBooking = async bookingId => {
  console.log('❌ REJECT BOOKING:', bookingId);

  return apiRequest(`/bookings/cancel/${bookingId}/`, {
    method: 'POST',
  });
};


// =====================================================
// GOOGLE PLACE SEARCH
// =====================================================

export const searchPlaces = async query => {
  const cleanQuery = String(query || '').trim();

  if (!cleanQuery) {
    return {
      results: [],
    };
  }

  console.log('🔎 PLACE SEARCH:', cleanQuery);

  return apiRequest(
    `/rides/place-search/?query=${encodeURIComponent(
      cleanQuery,
    )}`,
    {
      method: 'GET',
    },
  );
};


// =====================================================
// GOOGLE PLACE DETAILS
// =====================================================

export const getPlaceDetails = async placeId => {
  console.log(
    '📍 PLACE DETAILS:',
    placeId,
  );

  return apiRequest(
    `/rides/place-details/?place_id=${encodeURIComponent(
      placeId,
    )}`,
    {
      method: 'GET',
    },
  );
};


// =====================================================
// REVERSE GEOCODING
// =====================================================

export const reverseGeocode = async (
  latitude,
  longitude,
) => {
  console.log(
    '📍 REVERSE GEOCODE:',
    latitude,
    longitude,
  );

  return apiRequest(
    `/rides/reverse-geocode/?latitude=${encodeURIComponent(
      latitude,
    )}&longitude=${encodeURIComponent(
      longitude,
    )}`,
    {
      method: 'GET',
    },
  );
};