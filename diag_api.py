import requests

print("e) Compare /api/host/listings and /api/listings")

for host_id in [1, 2, 3, 4]:
    # guest side API
    guest_listings = requests.get(f"http://localhost:8000/api/listings?host_id={host_id}").json()
    if isinstance(guest_listings, dict) and "items" in guest_listings:
        guest_ids = [l["id"] for l in guest_listings["items"]]
    else:
        guest_ids = []

    # mock a request as the host
    headers = {"X-User-Id": str(host_id)}
    host_listings = requests.get(f"http://localhost:8000/api/host/listings", headers=headers).json()
    host_ids = [l["id"] for l in host_listings] if isinstance(host_listings, list) else []

    print(f"Host {host_id}: Guest count = {len(guest_ids)}, Host count = {len(host_ids)}")
    print(f"   In Guest only: {set(guest_ids) - set(host_ids)}")
    print(f"   In Host only: {set(host_ids) - set(guest_ids)}")
