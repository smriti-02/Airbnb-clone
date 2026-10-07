import sys
import os
import argparse
from datetime import datetime
import shutil

# Add backend to path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import engine, SessionLocal
from models.models import Listing, User


"""
assign_demo_owners.py

Reassigns listing ownerships to fix missing or non-host hosts, and ensures demo hosts
have enough listings by rebalancing regionally if needed.

Running `seed.py --reset` would revert this.
"""

DEMO_EMAILS = [
    "aarav@example.com",
    "priya@example.com",
    "rohan@example.com",
    "ananya@example.com"
]

WEST = ["Goa", "Maharashtra", "Gujarat"]
NORTH = ["Rajasthan", "Delhi", "Himachal Pradesh", "Uttarakhand", "Punjab", "Uttar Pradesh", "Ladakh", "Jammu & Kashmir", "Jammu and Kashmir"]
SOUTH = ["Kerala", "Karnataka", "Tamil Nadu", "Telangana", "Puducherry"]
# East and Central is the fallback

def get_demo_host(state: str, hosts_map: dict):
    if state in WEST:
        return hosts_map[DEMO_EMAILS[0]]
    elif state in NORTH:
        return hosts_map[DEMO_EMAILS[1]]
    elif state in SOUTH:
        return hosts_map[DEMO_EMAILS[2]]
    else:
        return hosts_map[DEMO_EMAILS[3]]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply the changes to the database")
    args = parser.parse_args()

    db = SessionLocal()
    
    try:
        # Get demo hosts
        demo_hosts = db.query(User).filter(User.email.in_(DEMO_EMAILS)).all()
        if len(demo_hosts) != 4:
            print(f"Error: expected 4 demo hosts, found {len(demo_hosts)}")
            return
            
        hosts_map = {h.email: h.id for h in demo_hosts}
        
        # Rule 1: Reassign bad host_ids
        all_listings = db.query(Listing).all()
        all_users = {u.id: u for u in db.query(User).all()}
        
        changes = []
        host_listing_counts = {u.id: 0 for u in all_users.values()}
        for l in all_listings:
            if l.host_id in host_listing_counts:
                host_listing_counts[l.host_id] += 1
                
        # Status counts before
        status_counts_before = {}
        for l in all_listings:
            st = l.status or 'null'
            status_counts_before[st] = status_counts_before.get(st, 0) + 1
            
        print("--- BEFORE ---")
        for hid, count in host_listing_counts.items():
            if count > 0:
                print(f"Host {hid} ({all_users[hid].email if hid in all_users else 'Unknown'}): {count} listings")
        print("Statuses:", status_counts_before)
        print("-------------")
        
        rule1_changes = 0
        rule2_changes = 0
        status_changes = 0
        is_host_changes = 0
        
        for l in all_listings:
            u = all_users.get(l.host_id)
            if u is None or not getattr(u, 'is_host', False):
                # Reassign to a demo host (e.g., fallback to East/Central)
                new_host_id = get_demo_host(l.state, hosts_map)
                if l.host_id in host_listing_counts:
                    host_listing_counts[l.host_id] -= 1
                host_listing_counts[new_host_id] += 1
                if args.apply:
                    l.host_id = new_host_id
                rule1_changes += 1
                
            if not l.status:
                if args.apply:
                    l.status = 'published'
                status_changes += 1

        # Check Rule 2
        needs_rebalance = any(host_listing_counts[hosts_map[email]] < 8 for email in DEMO_EMAILS)
        if needs_rebalance:
            print("Rule 2 triggered: Rebalancing by region...")
            # Rebalance all listings owned by demo hosts (or all listings? "rebalance deterministically by region so every host gets a coherent area")
            # Let's rebalance ALL listings, or just those owned by the demo hosts.
            # "every host gets a coherent area" implies we just apply region rule to all.
            for l in all_listings:
                new_host_id = get_demo_host(l.state, hosts_map)
                if l.host_id != new_host_id:
                    if l.host_id in host_listing_counts:
                        host_listing_counts[l.host_id] -= 1
                    host_listing_counts[new_host_id] += 1
                    if args.apply:
                        l.host_id = new_host_id
                    rule2_changes += 1
                    
        # Update users.is_host
        for l in all_listings:
            # use apply logic if changed
            hid = l.host_id
            u = all_users.get(hid)
            if u and not u.is_host:
                if args.apply:
                    u.is_host = True
                is_host_changes += 1
                
        print("\n--- AFTER (Projected) ---")
        for hid, count in host_listing_counts.items():
            if count > 0:
                print(f"Host {hid} ({all_users[hid].email if hid in all_users else 'Unknown'}): {count} listings")
                
        # Status counts after
        status_counts_after = {}
        for l in all_listings:
            st = l.status or ('published' if not l.status else l.status)
            status_counts_after[st] = status_counts_after.get(st, 0) + 1
        print("Statuses:", status_counts_after)
        print("-------------")
        
        print(f"Rule 1 reassignments: {rule1_changes}")
        print(f"Rule 2 reassignments (Rebalance): {rule2_changes}")
        print(f"Status fixes (NULL -> published): {status_changes}")
        print(f"is_host flags updated: {is_host_changes}")
        
        if not args.apply:
            print("\nDRY RUN. Use --apply to save changes.")
        else:
            db_url_str = str(engine.url)
            if db_url_str.startswith("sqlite"):
                db_path = db_url_str.replace("sqlite:///", "").replace("sqlite://", "")
                if os.path.exists(db_path):
                    bak_path = f"{db_path}.bak-{datetime.now().strftime('%Y%m%d%H%M%S')}"
                    shutil.copy2(db_path, bak_path)
                    print(f"Database backed up to {bak_path}")
            
            db.commit()
            print("Changes applied successfully.")
            
    finally:
        db.close()

if __name__ == "__main__":
    main()
