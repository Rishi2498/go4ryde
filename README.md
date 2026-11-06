# GO4RYDE Backend

This is the backend for the GO4RYDE smart carpooling platform, similar to BlaBlaCar. It is built using Django, Django Rest Framework (DRF), and uses PostgreSQL with PostGIS for geospatial functionality.

## Features Let
* **User Authentication**: Passwordless OTP-based authentication with JWT.
* **Geospatial Matching**: Matches rides using PostGIS logic (5km radius, time buffer, and route intersection).
* **Payments**: Integrated with Razorpay for handling ride bookings.
* **Real-time Tracking**: WebSockets enabled via Django Channels to track driver live locations.
* **Admin Dashboard**: Approvals for driver DL/RC verifications and system overview.

## Setup Instructions

### Prerequisites
* Python 3.10+
* PostgreSQL with **PostGIS** extension enabled
* Redis (for Django Channels)

### 1. Database Setup
Create an empty PostgreSQL database and enable PostGIS:
```sql
CREATE DATABASE go4ryde_db;
\c go4ryde_db
CREATE EXTENSION postgis;
```

### 2. Environment Setup
Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Apply configurations
Update `go4ryde_backend/settings.py` with your database credentials, Redis url, Google Maps key, and Razorpay API keys.

### 4. Run Migrations
Generate and apply database migrations:
```bash
cd go4ryde_backend
python manage.py makemigrations accounts rides bookings payments tracking notifications
python manage.py migrate
```

### 5. Run Server
Django Channels uses Daphne/ASGI. You can start the server via runserver defaults:
```bash
python manage.py runserver
```

## API Endpoints

### Accounts
- `POST /api/accounts/auth/send-otp/`: Request an OTP for email. Pass `email` (and optionally `phone_number`, `name` if registering).
- `POST /api/accounts/auth/verify-otp/`: Verify OTP. Returns JWT Access and Refresh tokens.

### Rides
- `POST /api/rides/create/`: Create a ride as a driver. Provide `source_lat`, `source_lng`, `dest_lat`, `dest_lng`, and `route_polyline`.
- `GET /api/rides/search/`: Search rides. Query params: `source_lat`, `source_lng`, `dest_lat`, `dest_lng`, `date_time`, `women_only` (optional).

### Bookings
- `POST /api/bookings/create/`: Create a booking for a ride (reserves seats).
- `GET /api/bookings/my-bookings/`: View user's bookings.

### Payments
- `POST /api/payments/create-order/`: Generates a Razorpay Order ID for a booking.
- `POST /api/payments/verify/`: Verifies Razorpay signature and confirms booking.

### Tracking
- `ws://<host>/ws/tracking/<ride_id>/`: WebSocket endpoint for live location streaming. Send payload `{"lat": x, "lng": y}` to broadcast.
