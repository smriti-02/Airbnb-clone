import sqlite3
from collections import Counter
import os

db_path = 'backend/airbnb.db'
if not os.path.exists(db_path):
    for f in os.listdir('backend'):
        if f.endswith('.db'):
            db_path = os.path.join('backend', f)
            break

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
c = conn.cursor()

total = c.execute('SELECT count(*) FROM listings').fetchone()[0]
status_counts = dict(c.execute('SELECT status, count(*) FROM listings GROUP BY status').fetchall())
print('a) Total listings:', total, '| Status counts:', status_counts)

host_counts = c.execute('''
    SELECT l.host_id, count(l.id) as count, u.id as u_id, u.is_host, u.name, u.email
    FROM listings l
    LEFT JOIN users u ON l.host_id = u.id
    GROUP BY l.host_id
''').fetchall()
print('b) Listings per host_id:')
demo_hosts = []
for h in host_counts:
    user_str = 'NULL/Missing' if h['u_id'] is None else f"exists, is_host={bool(h['is_host'])}, {h['name']}, {h['email']}"
    print(f"   host_id {h['host_id']}: {h['count']} listings | User: {user_str}")
    if h['email'] and h['email'].endswith('@example.com') and h['is_host']:
        demo_hosts.append(h['u_id'])

print('c) Demo hosts:')
for uid in demo_hosts:
    count = c.execute('SELECT count(*) FROM listings WHERE host_id = ?', (uid,)).fetchone()[0]
    print(f"   host {uid}: {count} listings")

bad_listings = c.execute('''
    SELECT count(l.id) FROM listings l
    LEFT JOIN users u ON l.host_id = u.id
    WHERE l.host_id IS NULL OR u.id IS NULL OR u.is_host = 0 OR u.is_host IS NULL
''').fetchone()[0]
print('d) Bad listings count:', bad_listings)
