import requests
import time


def get_coordinates(place_name):
    url = "https://nominatim.openstreetmap.org/search"

    headers = {
        "User-Agent": "GO4RYDE_APP"
    }

    def fetch(query):
        params = {
            "q": query,
            "format": "json",
            "limit": 1
        }

        response = requests.get(url, params=params, headers=headers)
        data = response.json()

        time.sleep(1)  # prevent rate limit

        if data:
            return {
                "lat": float(data[0]["lat"]),
                "lng": float(data[0]["lon"])
            }
        return None

    # 🔥 1. TRY FULL ADDRESS
    result = fetch(place_name)

    if result:
        return result

    # 🔥 2. FALLBACK → SIMPLIFY LOCATION
    simplified = place_name.split(",")[0]  # take main name

    result = fetch(simplified)

    if result:
        return result

    # 🔥 3. FINAL FAIL
    raise ValueError(f"Location not found: {place_name}")