import math
try:
    from django.contrib.gis.geos import Point as GEOSPoint
    from django.contrib.gis.measure import D
    HAS_GIS = True
except Exception:
    HAS_GIS = False

class MockPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.coords = (x, y)
    
    def __str__(self):
        return f"SRID=4326;POINT ({self.x} {self.y})"

def get_point(lat, lng):
    if HAS_GIS:
        return GEOSPoint(lng, lat, srid=4326)
    return MockPoint(lng, lat)

def calculate_gis_distance(p1, p2):
    """
    Returns distance in km between two points.
    Uses GeoDjango distance if available, else Haversine.
    """
    if HAS_GIS and isinstance(p1, GEOSPoint) and isinstance(p2, GEOSPoint):
        # This is a simplified version; in a real GIS query you'd use .distance()
        # but here we are just emulating the logic.
        from django.contrib.gis.db.models.functions import Distance
        # For simple point calculation we can use haversine as it's accurate enough
        pass 
    
    # Haversine implementation
    lat1, lon1 = p1.y if hasattr(p1, 'y') else p1.coords[1], p1.x if hasattr(p1, 'x') else p1.coords[0]
    lat2, lon2 = p2.y if hasattr(p2, 'y') else p2.coords[1], p2.x if hasattr(p2, 'x') else p2.coords[0]
    
    # Standard Haversine
    r = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    return r*c

def get_road_distance_estimate(p1, p2):
    """
    Applies distance factor for road network estimation.
    """
    straight_dist = calculate_gis_distance(p1, p2)
    return round(straight_dist * 1.25, 2)
