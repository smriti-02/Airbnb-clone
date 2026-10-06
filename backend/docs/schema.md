# Airbnb Clone Schema Documentation

## Entity-Relationship Diagram
```mermaid
erDiagram
    users {
        int id PK
        string name
        string email
        string avatar_url
        boolean is_host
        datetime created_at
        string bio
        date joined_at
    }

    listings {
        int id PK
        int host_id FK
        string title
        string description
        string property_type
        float price_per_night
        float cleaning_fee
        float service_fee_pct
        string city
        string state
        string country
        string address
        float latitude
        float longitude
        int max_guests
        int bedrooms
        int beds
        float bathrooms
        datetime created_at
        datetime updated_at
    }

    listing_photos {
        int id PK
        int listing_id FK
        string url
        int position
    }

    amenities {
        int id PK
        string name
        string icon
    }

    listing_amenities {
        int listing_id FK
        int amenity_id FK
    }

    bookings {
        int id PK
        int listing_id FK
        int guest_id FK
        date check_in
        date check_out
        int guests
        int nights
        float subtotal
        float cleaning_fee
        float service_fee
        float total
        string status
        datetime created_at
    }

    reviews {
        int id PK
        int listing_id FK
        int booking_id FK
        int guest_id FK
        int rating
        string comment
        datetime created_at
    }

    wishlists {
        int user_id FK
        int listing_id FK
        datetime created_at
    }

    %% Relationships
    users ||--o{ listings : "hosts"
    users ||--o{ bookings : "makes"
    users ||--o{ reviews : "writes"
    users ||--o{ wishlists : "creates"
    listings ||--o{ listing_photos : "has"
    listings ||--o{ bookings : "receives"
    listings ||--o{ reviews : "receives"
    listings ||--o{ wishlists : "is added to"
    listings ||--o{ listing_amenities : "has"
    amenities ||--o{ listing_amenities : "associated with"
    bookings ||--o| reviews : "receives exactly one"
```

## Relationships Explained

1. **User ↔ Listing (1:N)**: A user (host) can own multiple listings. This is defined by `Listing.host_id`. Cascades on delete.
2. **User ↔ Booking (1:N)**: A user (guest) can make multiple bookings. This is defined by `Booking.guest_id`.
3. **Listing ↔ Photo (1:N)**: A listing can have multiple photos, tracked by `listing_photos`. The order is determined by `position`.
4. **Listing ↔ Amenity (N:M)**: A listing can have multiple amenities (e.g., Wifi, Pool) and an amenity applies to many listings. Supported via the `listing_amenities` association table.
5. **Listing ↔ Booking (1:N)**: A listing can have many bookings over time. Handled by `Booking.listing_id`.
6. **Booking ↔ Review (1:1)**: A booking can only have one review. Handled by the `UNIQUE` constraint on `Review.booking_id`.
7. **Listing ↔ Review (1:N)**: Denormalized for quick fetching. Reviews belong to listings (and users), linked to bookings.
8. **User ↔ Wishlist ↔ Listing (N:M)**: A user can wishlist multiple listings, and a listing can be wishlisted by many users. Using composite primary key (`user_id`, `listing_id`).
