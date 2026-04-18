import googlemaps
from django.conf import settings
from django.core.cache import cache
import hashlib

def get_google_client():
    api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', None)
    if not api_key or api_key == 'your_google_maps_api_key':
        return None
    try:
        return googlemaps.Client(key=api_key)
    except Exception:
        return None

def get_coordinates(address):
    """
    Convert address to (lat, lng) using Google Geocoding API.
    """
    if not address:
        return None
    
    cache_key = f"geo_{hashlib.md5(address.lower().encode()).hexdigest()}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    client = get_google_client()
    if not client:
        return None

    try:
        result = client.geocode(address)
        if result:
            location = result[0]['geometry']['location']
            coords = (location['lat'], location['lng'])
            cache.set(cache_key, coords, 86400) # Cache for 24 hours
            return coords
    except Exception as e:
        print(f"Geocoding error for {address}: {e}")
    
    return None

def get_place_suggestions(query):
    """
    Get place suggestions for autocomplete.
    """
    if not query:
        return []
        
    cache_key = f"suggest_{hashlib.md5(query.lower().encode()).hexdigest()}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    client = get_google_client()
    if not client:
        return []

    try:
        # Restriction to India for better relevance in GO4RYDE
        response = client.places_autocomplete(
            input_text=query,
            components={"country": "IN"}
        )
        suggestions = []
        for pred in response:
            suggestions.append({
                'description': pred['description'],
                'place_id': pred['place_id'],
                'main_text': pred['structured_formatting']['main_text'],
                'secondary_text': pred['structured_formatting'].get('secondary_text', '')
            })
        cache.set(cache_key, suggestions, 3600) # Cache for 1 hour
        return suggestions
    except Exception as e:
        print(f"Autocomplete error: {e}")
        return []

def get_place_details(place_id):
    """
    Get coordinates and formatted address for a specific place_id.
    """
    if not place_id:
        return None

    cache_key = f"place_{place_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    client = get_google_client()
    if not client:
        return None

    try:
        result = client.place(place_id=place_id, fields=['geometry', 'formatted_address', 'name'])
        if result and 'result' in result:
            res = result['result']
            location = res['geometry']['location']
            data = {
                'name': res.get('name', ''),
                'formatted_address': res.get('formatted_address', ''),
                'lat': location['lat'],
                'lng': location['lng']
            }
            cache.set(cache_key, data, 86400)
            return data
    except Exception as e:
        print(f"Place details error: {e}")
    
    return None

def get_route_data(origin, destination):
    """
    Get distance (km), duration (mins), and encoded polyline using Directions API.
    Accepted formats for origin/dest: strings (addresses), place ids, or dicts/tuples (lat, lng).
    """
    cache_key = f"route_{hashlib.md5(str(origin).lower().encode()).hexdigest()}_{hashlib.md5(str(destination).lower().encode()).hexdigest()}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    client = get_google_client()
    if not client:
        return None

    try:
        # If origin/dest are coords, format them for Google API
        # Google API accepts (lat, lng) tuples or "lat,lng" strings
        directions = client.directions(
            origin,
            destination,
            mode="driving",
            units="metric",
            departure_time="now" # To get traffic-aware duration if available
        )
        
        if directions:
            leg = directions[0]['legs'][0]
            data = {
                'distance_km': round(leg['distance']['value'] / 1000.0, 2),
                'duration_mins': round(leg['duration']['value'] / 60.0),
                'polyline': directions[0]['overview_polyline']['points']
            }
            cache.set(cache_key, data, 86400)
            return data
    except Exception as e:
        print(f"Directions API error: {e}")
    
    return None
