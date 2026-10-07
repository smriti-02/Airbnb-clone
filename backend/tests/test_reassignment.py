import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models import User, Listing, Booking
from database import Base
from scripts.assign_demo_owners import DEMO_EMAILS, get_demo_host

@pytest.fixture(scope="function")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()

def setup_demo_hosts(db):
    for email in DEMO_EMAILS:
        db.add(User(name=email.split('@')[0], email=email, is_host=True))
    db.commit()

def test_reassignment_logic_orphans(test_db):
    setup_demo_hosts(test_db)
    hosts_map = {h.email: h.id for h in test_db.query(User).filter(User.email.in_(DEMO_EMAILS)).all()}
    
    # Create an orphan listing (host_id that doesn't exist)
    l1 = Listing(title="Orphan", host_id=999, price_per_night=100, city="Goa", state="Goa", country="India", address="1", latitude=0, longitude=0)
    test_db.add(l1)
    
    # Create a non-host owner
    u2 = User(name="Not Host", email="no@example.com", is_host=False)
    test_db.add(u2)
    test_db.commit()
    
    l2 = Listing(title="Non Host", host_id=u2.id, price_per_night=100, city="Delhi", state="Delhi", country="India", address="2", latitude=0, longitude=0)
    test_db.add(l2)
    test_db.commit()
    
    # Simulate rule 1
    for l in test_db.query(Listing).all():
        u = test_db.query(User).filter(User.id == l.host_id).first()
        if not u or not getattr(u, 'is_host', False):
            l.host_id = get_demo_host(l.state, hosts_map)
    test_db.commit()
    
    # Verify reassignment
    # Goa goes to WEST (Aarav)
    assert l1.host_id == hosts_map["aarav@example.com"]
    # Delhi goes to NORTH (Priya)
    assert l2.host_id == hosts_map["priya@example.com"]

def test_rebalancing(test_db):
    setup_demo_hosts(test_db)
    hosts_map = {h.email: h.id for h in test_db.query(User).filter(User.email.in_(DEMO_EMAILS)).all()}
    
    # Give all listings to host 1
    h1_id = hosts_map["aarav@example.com"]
    for i in range(10):
        test_db.add(Listing(title=f"L{i}", host_id=h1_id, state="Kerala" if i < 5 else "Delhi", price_per_night=100, city="C", country="India", address="A", latitude=0, longitude=0))
    test_db.commit()
    
    # Host 1 has 10, but others have 0. Rule 2 triggers.
    counts = {uid: 0 for uid in hosts_map.values()}
    for l in test_db.query(Listing).all():
        counts[l.host_id] += 1
        
    needs_rebalance = any(counts[uid] < 8 for uid in hosts_map.values())
    assert needs_rebalance
    
    for l in test_db.query(Listing).all():
        l.host_id = get_demo_host(l.state, hosts_map)
    test_db.commit()
    
    # Kerala goes to South (Rohan), Delhi goes to North (Priya)
    counts = {uid: 0 for uid in hosts_map.values()}
    for l in test_db.query(Listing).all():
        counts[l.host_id] += 1
        
    assert counts[hosts_map["rohan@example.com"]] == 5
    assert counts[hosts_map["priya@example.com"]] == 5
    assert counts[hosts_map["aarav@example.com"]] == 0

def test_idempotent(test_db):
    setup_demo_hosts(test_db)
    hosts_map = {h.email: h.id for h in test_db.query(User).filter(User.email.in_(DEMO_EMAILS)).all()}
    
    # Give everyone 10 listings so rule 2 doesn't trigger
    states = ["Goa", "Delhi", "Kerala", "Assam"]
    for i, email in enumerate(DEMO_EMAILS):
        hid = hosts_map[email]
        for _ in range(10):
            test_db.add(Listing(title="L", host_id=hid, state=states[i], price_per_night=100, city="C", country="I", address="A", latitude=0, longitude=0))
    test_db.commit()
    
    # Snapshot host_ids
    snapshot = [l.host_id for l in test_db.query(Listing).all()]
    
    # Run logic
    for l in test_db.query(Listing).all():
        l.host_id = get_demo_host(l.state, hosts_map)
    test_db.commit()
    
    # Check no changes
    assert snapshot == [l.host_id for l in test_db.query(Listing).all()]

