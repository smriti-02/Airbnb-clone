import urllib.request
import urllib.error
import json

url = "https://airbnb-clone-ho22.onrender.com/api/host/listings/68"
data = {
    "photos": [],
    "property_type": "Villa",
    "place_type": "entire",
    "country": "India",
    "address": "123 Palm Grove",
    "pincode": "403516",
    "city": "Goa",
    "state": "Goa",
    "latitude": 15.5503,
    "longitude": 73.7663,
    "max_guests": 6,
    "bedrooms": 3,
    "beds": 3,
    "bathrooms": 2.0,
    "amenities": [1, 2, 3, 5, 7],
    "title": "Luxury Palm Villa in Baga",
    "description": "Welcome to our beautiful luxury villa, perfectly situated just 5 minutes from Baga beach. Enjoy the private pool and lush gardens.",
    "price_per_night": 8500,
    "cleaning_fee": 1200,
    "instant_book": True,
    "wizard_step": "publish"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='PATCH')
req.add_header('Content-Type', 'application/json')
req.add_header('x-user-id', '1') # mock host
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(e)
