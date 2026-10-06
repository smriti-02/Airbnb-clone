from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import listings, bookings, host, misc

app = FastAPI(title="Airbnb Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(host.router)
app.include_router(misc.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Airbnb Clone API"}
