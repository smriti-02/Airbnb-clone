import urllib.request
import urllib.error

UNSPLASH_IDS = [
    "1522708323590-d24dbb6b0267", "1480074568708-e8b5c010bab8", "1502672260266-1c1b56112f59",
    "1512917774080-9991f1c4c750", "1493809842364-4bf87b648003", "1494438639946-1ebd1d20bf85",
    "1518780664697-55e3ad937233", "1501183638710-841f58925562", "1449844908441-8829872d2607",
    "1528909514045-2ba4ae4a4a58", "1472224371017-0824efa9a116", "1505691938895-1758d7feb511",
    "1430285561322-780f5f52cece", "1515263487990-61b07816bc8e", "1475855581690-80ba6452f15e",
    "1497362948500-f02016ed3d2c", "1510798831971-6d1ebaf8f829", "1416331108676-a22ccb276e35"
]

for uid in UNSPLASH_IDS:
    url = f"https://images.unsplash.com/photo-{uid}?auto=format&fit=crop&w=800&q=80"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"{uid}: OK")
    except urllib.error.HTTPError as e:
        print(f"{uid}: FAILED {e.code}")
    except Exception as e:
        print(f"{uid}: ERROR {e}")
