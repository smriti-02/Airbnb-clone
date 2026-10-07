import logging
from sqlalchemy import text, inspect
from models.models import Base

logger = logging.getLogger(__name__)

def apply_lightweight_migrations(engine):
    """
    Checks PRAGMA table_info for existing columns. 
    Runs ALTER TABLE ADD COLUMN with a DEFAULT only if the column is missing.
    Idempotent. Does not drop or recreate tables.
    """
    logger.info("Checking for lightweight migrations...")
    
    with engine.connect() as conn:
        inspector = inspect(conn)
        
        # Helper to get existing columns
        def get_columns(table_name):
            try:
                return {col['name'] for col in inspector.get_columns(table_name)}
            except Exception:
                return set()

        # Users table migrations
        user_cols = get_columns('users')
        if 'users' in inspector.get_table_names():
            if 'phone' not in user_cols:
                logger.info("Adding phone to users")
                conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
            if 'phone_verified' not in user_cols:
                logger.info("Adding phone_verified to users")
                conn.execute(text("ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT 0"))

        # Listings table migrations
        listing_cols = get_columns('listings')
        if 'listings' in inspector.get_table_names():
            if 'status' not in listing_cols:
                logger.info("Adding status to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN status VARCHAR DEFAULT 'published'"))
            if 'wizard_step' not in listing_cols:
                logger.info("Adding wizard_step to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN wizard_step VARCHAR DEFAULT 'done'"))
            if 'place_type' not in listing_cols:
                logger.info("Adding place_type to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN place_type VARCHAR DEFAULT 'entire'"))
            if 'instant_book' not in listing_cols:
                logger.info("Adding instant_book to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN instant_book BOOLEAN DEFAULT 1"))
            if 'min_nights' not in listing_cols:
                logger.info("Adding min_nights to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN min_nights INTEGER DEFAULT 1"))
            if 'highlights' not in listing_cols:
                logger.info("Adding highlights to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN highlights JSON DEFAULT '[]'"))
            if 'safety_details' not in listing_cols:
                logger.info("Adding safety_details to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN safety_details JSON DEFAULT '{}'"))
            if 'new_listing_promo' not in listing_cols:
                logger.info("Adding new_listing_promo to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN new_listing_promo BOOLEAN DEFAULT 0"))
            if 'weekly_discount_pct' not in listing_cols:
                logger.info("Adding weekly_discount_pct to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN weekly_discount_pct INTEGER DEFAULT 0"))
            if 'monthly_discount_pct' not in listing_cols:
                logger.info("Adding monthly_discount_pct to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN monthly_discount_pct INTEGER DEFAULT 0"))
            if 'published_at' not in listing_cols:
                logger.info("Adding published_at to listings")
                conn.execute(text("ALTER TABLE listings ADD COLUMN published_at DATETIME"))
                
        # Bookings table migrations
        booking_cols = get_columns('bookings')
        if 'bookings' in inspector.get_table_names():
            if 'discount_amount' not in booking_cols:
                logger.info("Adding discount_amount to bookings")
                conn.execute(text("ALTER TABLE bookings ADD COLUMN discount_amount INTEGER DEFAULT 0"))
            if 'discount_type' not in booking_cols:
                logger.info("Adding discount_type to bookings")
                conn.execute(text("ALTER TABLE bookings ADD COLUMN discount_type VARCHAR"))
            if 'host_note' not in booking_cols:
                logger.info("Adding host_note to bookings")
                conn.execute(text("ALTER TABLE bookings ADD COLUMN host_note VARCHAR"))

        conn.commit()

    # Create all will create any new tables that don't exist yet
    logger.info("Running create_all for new tables...")
    Base.metadata.create_all(engine)
    logger.info("Lightweight migrations complete.")
