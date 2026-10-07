import urllib.request
import urllib.error
import json

url = "https://airbnb-clone-ho22.onrender.com/api/host/listings/68/photos"
data = {"url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='POST')
req.add_header('Content-Type', 'application/json')
req.add_header('x-user-id', '1')
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(e)
