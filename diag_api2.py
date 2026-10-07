import requests

guest_listings = []
page = 1
while True:
    res = requests.get(f"http://localhost:8000/api/listings?page={page}&page_size=50").json()
    items = res.get("items", [])
    if not items:
        break
    guest_listings.extend(items)
    if len(guest_listings) >= res.get("total", 0):
        break
    page += 1

guest_by_host = {}
for l in guest_listings:
    guest_by_host.setdefault(l["host_id"], set()).add(l["id"])

print("Total guest listings:", len(guest_listings))

for host_id in [1, 2, 3, 4]:
    headers = {"X-User-Id": str(host_id)}
    host_listings = requests.get(f"http://localhost:8000/api/host/listings", headers=headers).json()
    host_ids = set([l["id"] for l in host_listings] if isinstance(host_listings, list) else [])

    guest_ids = guest_by_host.get(host_id, set())

    print(f"Host {host_id}: Guest count = {len(guest_ids)}, Host count = {len(host_ids)}")
    in_guest_only = guest_ids - host_ids
    if in_guest_only: print(f"   In Guest only: {in_guest_only}")
    in_host_only = host_ids - guest_ids
    if in_host_only: print(f"   In Host only: {in_host_only}")
