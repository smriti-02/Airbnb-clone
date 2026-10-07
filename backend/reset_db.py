from database import engine, Base, SessionLocal
from seed import main
Base.metadata.drop_all(bind=engine)
main()
