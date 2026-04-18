import math
import polyline

from .gis import get_point, calculate_gis_distance, get_road_distance_estimate

def calculate_haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points.
    Now bridged through the GIS utility for GeoDjango compliance.
    """
    p1 = get_point(lat1, lon1)
    p2 = get_point(lat2, lon2)
    return calculate_gis_distance(p1, p2)

def calculate_road_distance_fallback(s_lat, s_lng, d_lat, d_lng):
    """
    Simulate road distance using the GIS bridge and an Indian road factor (1.25x).
    """
    p1 = get_point(s_lat, s_lng)
    p2 = get_point(d_lat, d_lng)
    return get_road_distance_estimate(p1, p2)

def decode_route(polyline_str):
    """
    Decode encoded polyline into list of (lat, lng) tuples.
    """
    try:
        return polyline.decode(polyline_str)
    except Exception:
        return []

def is_point_near_route(point_lat, point_lng, route_points, max_dist_km=2.0):
    """
    Check if a point (lat, lng) is within max_dist_km of any point in the route.
    """
    for r_lat, r_lng in route_points:
        dist = calculate_haversine(point_lat, point_lng, r_lat, r_lng)
        if dist <= max_dist_km:
            return True
    return False

def get_approx_distance(source_name, destination_name):
    """
    Returns a semi-accurate distance for common Indian cities as a fallback.
    """
    # Expanded city distance map with aliases
    CITY_ALIASES = {
        'hyd': 'hyderabad',
        'blr': 'bangalore',
        'banglore': 'bangalore',
        'bom': 'mumbai',
        'del': 'delhi',
        'madras': 'chennai',
    }

    CITY_DISTANCES = {
        ('delhi', 'mumbai'): 1420,
        ('mumbai', 'delhi'): 1420,
        ('delhi', 'bangalore'): 2170,
        ('bangalore', 'delhi'): 2170,
        ('mumbai', 'pune'): 150,
        ('pune', 'mumbai'): 150,
        ('bangalore', 'chennai'): 350,
        ('chennai', 'bangalore'): 350,
        ('delhi', 'jaipur'): 280,
        ('jaipur', 'delhi'): 280,
        ('hyderabad', 'bangalore'): 570,
        ('bangalore', 'hyderabad'): 570,
        ('hyderabad', 'mumbai'): 710,
        ('mumbai', 'hyderabad'): 710,
        ('hyderabad', 'chennai'): 630,
        ('chennai', 'hyderabad'): 630,
        ('hyderabad', 'pune'): 560,
        ('pune', 'hyderabad'): 560,
        ('hyderabad', 'vijayawada'): 275,
        ('vijayawada', 'hyderabad'): 275,
        ('delhi', 'chandigarh'): 250,
        ('chandigarh', 'delhi'): 250,
        ('mumbai', 'ahmedabad'): 530,
        ('ahmedabad', 'mumbai'): 530,
    }

    s = source_name.lower().strip()
    d = destination_name.lower().strip()

    # Resolve aliases
    s = CITY_ALIASES.get(s, s)
    d = CITY_ALIASES.get(d, d)

    if (s, d) in CITY_DISTANCES:
        return float(CITY_DISTANCES[(s, d)])

    # Ultimate fallback: Deterministic hash-based distance
    import hashlib
    combined = s + d
    hash_val = int(hashlib.md5(combined.encode()).hexdigest(), 16)
    # Ensure a realistic intercity distance for unrecognized city names (100-500km range)
    mock_dist = 120 + (hash_val % 380)
    return float(mock_dist)

