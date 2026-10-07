import os
import json
from database import engine, Base, SessionLocal
import seed

import hashlib

def test_seed_frozen_data_counts_and_checksum(test_db_session):
    # This test verifies that the frozen seed data has the expected minimum counts
    # and hasn't been tampered with.
    
    seed_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "seed_data")
    
    # 0. Check checksums
    with open(os.path.join(seed_data_dir, "CHECKSUM.sha256"), "r") as f:
        lines = f.read().strip().split("\n")
    for line in lines:
        if not line.strip(): continue
        expected_hash, filename = line.split(" ", 1)
        actual_hash = hashlib.sha256(open(os.path.join(seed_data_dir, filename.strip()), "rb").read()).hexdigest()
        assert expected_hash == actual_hash, f"Checksum mismatch for {filename.strip()}"

    # 1. Assert counts
    with open(os.path.join(seed_data_dir, "listings.json"), "r", encoding="utf-8") as f:
        listings = json.load(f)
    
    assert len(listings) >= 60, "Must have 60+ listings"
    for l in listings:
        assert len(l["photos"]) == 5, f"Listing {l['id']} must have exactly 5 photos"
        
    with open(os.path.join(seed_data_dir, "bookings.json"), "r", encoding="utf-8") as f:
        bookings = json.load(f)
    assert len(bookings) >= 40, "Must have 40+ bookings"
    
    with open(os.path.join(seed_data_dir, "reviews.json"), "r", encoding="utf-8") as f:
        reviews = json.load(f)
    assert len(reviews) >= 100, "Must have 100+ reviews"
