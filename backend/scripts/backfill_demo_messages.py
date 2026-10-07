import os
import json
import random
from datetime import datetime, timedelta
import sys
import argparse
import shutil

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from database import SessionLocal, SQLALCHEMY_DATABASE_URL
from models.models import Booking, Listing, Conversation, Message, ConversationRead

def backup_db():
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///./"):
        db_path = SQLALCHEMY_DATABASE_URL.split("sqlite:///./")[1]
        db_path = os.path.join(os.path.dirname(__file__), '..', db_path)
        if os.path.exists(db_path):
            backup_path = db_path + ".messages_backup"
            shutil.copy2(db_path, backup_path)
            print(f"Backed up database to {backup_path}")

def run_backfill(apply=False):
    db = SessionLocal()
    try:
        json_path = os.path.join(os.path.dirname(__file__), 'demo_messages.json')
        if not os.path.exists(json_path):
            print("demo_messages.json not found")
            return
            
        with open(json_path, 'r') as f:
            templates = json.load(f)
            
        bookings = db.query(Booking).filter(Booking.status == 'confirmed').limit(15).all()
        if not bookings:
            print("No bookings found to backfill.")
            return
            
        for b in bookings:
            listing = db.query(Listing).filter(Listing.id == b.listing_id).first()
            if not listing:
                continue
                
            c = db.query(Conversation).filter_by(listing_id=b.listing_id, guest_id=b.guest_id).first()
            if not c:
                if apply:
                    c = Conversation(listing_id=b.listing_id, guest_id=b.guest_id, host_id=listing.host_id, booking_id=b.id)
                    db.add(c)
                    db.commit()
                    db.refresh(c)
                print(f"[{'APPLY' if apply else 'DRY RUN'}] Created conversation for listing {b.listing_id}, guest {b.guest_id}")
            
            if apply:
                cin = b.check_in.strftime("%d %b") if hasattr(b.check_in, "strftime") else str(b.check_in)
                cout = b.check_out.strftime("%d %b") if hasattr(b.check_out, "strftime") else str(b.check_out)
                sys_text = f"Reservation confirmed · {cin}-{cout} · {b.guests} guest{'s' if b.guests > 1 else ''}"
                
                sys_msg = Message(conversation_id=c.id, kind='system', body=sys_text)
                db.add(sys_msg)
                
                seq = random.choice(templates)
                last_msg = None
                
                base_time = datetime.utcnow() - timedelta(days=2)
                for i, t in enumerate(seq):
                    sender = c.guest_id if t['role'] == 'guest' else c.host_id
                    msg_time = base_time + timedelta(hours=i*2)
                    msg = Message(conversation_id=c.id, kind='user', sender_id=sender, body=t['body'], created_at=msg_time)
                    db.add(msg)
                    last_msg = msg
                    
                c.last_message_at = base_time + timedelta(hours=len(seq)*2)
                db.commit()
                
                # Make it read for the sender always. For recipient, 33% chance unread.
                for u_id in (c.guest_id, c.host_id):
                    # if u_id is the sender of the last msg, it's read.
                    if u_id == last_msg.sender_id:
                        read = ConversationRead(conversation_id=c.id, user_id=u_id, last_read_message_id=last_msg.id)
                        db.merge(read)
                    else:
                        # 66% chance of being read by recipient
                        if random.random() > 0.33:
                            read = ConversationRead(conversation_id=c.id, user_id=u_id, last_read_message_id=last_msg.id)
                            db.merge(read)
                            
                db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply changes to the database")
    args = parser.parse_args()
    
    if args.apply:
        print("Applying backfill to DB...")
        backup_db()
    else:
        print("Dry run only. Use --apply to save.")
        
    run_backfill(args.apply)
