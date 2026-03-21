import math
from datetime import datetime


def calculate_distance(lat1, lon1, lat2, lon2):
    """Return distance between two points in kilometres using the Haversine formula."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# Average fuel prices in INR (can be updated or fetched from API later)
FUEL_PRICES = {
    'petrol': 103.0,
    'diesel': 90.0,
    'electric': 5.0,  # approximate per km cost for EVs
}

# Peak hours (24-hour format)
PEAK_HOURS = [(7, 10), (17, 20)]  # 7-10 AM and 5-8 PM
PEAK_MULTIPLIER = 1.3


def is_peak_hour(departure_time: datetime) -> bool:
    """Check if the given time falls within peak hours."""
    hour = departure_time.hour
    for start, end in PEAK_HOURS:
        if start <= hour < end:
            return True
    return False


def calculate_ride_price(distance_km, mileage, fuel_type, vehicle_type, num_passengers, departure_time, tolls=0):
    """
    Calculate price per seat for a ride.

    Args:
        distance_km: Distance of the ride in km
        mileage: Vehicle mileage in km/l
        fuel_type: 'petrol', 'diesel', or 'electric'
        vehicle_type: 'car' or 'bike'
        num_passengers: Number of passengers sharing the ride
        departure_time: datetime of departure
        tolls: Toll charges in INR (default 0)

    Returns:
        price_per_seat: Price per passenger seat in INR
    """
    fuel_price = FUEL_PRICES.get(fuel_type, FUEL_PRICES['petrol'])

    if vehicle_type == 'bike':
        base_cost = (distance_km / max(mileage, 1)) * fuel_price
        price = base_cost
    else:
        fuel_cost = (distance_km / max(mileage, 1)) * fuel_price
        total_cost = fuel_cost + tolls
        price = total_cost / max(num_passengers, 1)

    # Apply peak hour surge
    if is_peak_hour(departure_time):
        price *= PEAK_MULTIPLIER

    return round(price, 2)
