from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import listings, bookings, host, misc, locations, auth, messages

from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
import os
import seed
import migrations
from database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "uploads", "listings"), exist_ok=True)
    try:
        migrations.apply_lightweight_migrations(engine)
        seed.main(reset=False)
    except Exception as e:
        print(f"Startup failed: {e}")
    yield

app = FastAPI(title="Airbnb Clone API", lifespan=lifespan)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [frontend_url]
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(host.router)
app.include_router(misc.router)
app.include_router(locations.router)
app.include_router(auth.router)
app.include_router(messages.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Airbnb Clone API"}
