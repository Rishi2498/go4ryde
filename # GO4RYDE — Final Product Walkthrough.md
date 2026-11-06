# GO4RYDE — Final Product Walkthrough

## 1. Product Overview

**GO4RYDE** is a smart carpooling platform that connects people who want to travel with drivers who have available seats.

The platform has two primary user roles:

* **Passenger** — searches for available rides and books seats.
* **Driver** — offers a ride, manages passengers, and conducts the trip.

The system is built around a central Django REST backend with a React web frontend.

### Core technology stack

**Backend**

* Python
* Django
* Django REST Framework
* JWT authentication
* Django Channels / ASGI
* Redis configuration
* Razorpay
* Google Maps Directions API

**Website**

* React
* Vite
* React Router
* Axios
* Google Maps
* Leaflet
* Framer Motion
* Lucide React
* CSS/Tailwind dependencies

**Database**

* The repository README describes PostgreSQL/PostGIS.
* The inspected `settings.py` in this branch is currently configured for SQLite during local development.

---

# 2. Overall Architecture

```text
                    GO4RYDE
                       │
          ┌────────────┴────────────┐
          │                         │
      React Website             Mobile App
          │                     (not included
          │                      in this branch)
          │
          └────────────┬────────────
                       │
                 REST API / JWT
                       │
                Django Backend
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   Accounts          Rides           Bookings
       │               │                │
       ├───────────────┼────────────────┤
       │               │                │
   Payments         Coupons          Chat
       │               │                │
       ├───────────────┼────────────────┤
       │               │                │
    Wallet         Tracking       Notifications
       │
    Razorpay
```

The frontend communicates with Django through Axios-based API services.

JWT access tokens are attached to authenticated API requests.

---

# 3. User Authentication

GO4RYDE uses passwordless authentication based around OTP.

The account system contains:

* Custom User model
* Email
* Phone number
* User role
* OTP model
* Profile
* Driver profile

User roles are:

```text
PASSENGER
DRIVER
ADMIN
```

The authentication flow is:

```text
Enter Email / Phone
        ↓
Request OTP
        ↓
OTP Verification
        ↓
JWT Access + Refresh Token
        ↓
Authenticated GO4RYDE session
```

The frontend authentication page handles:

* Login
* Registration
* OTP entry
* Authentication state
* Navigation after successful authentication

The backend exposes authentication routes under:

```text
/api/accounts/
```

Important endpoints include:

```text
POST /api/accounts/send-otp/
POST /api/accounts/register/
POST /api/accounts/login/
POST /api/accounts/driver-upgrade/
POST /api/accounts/logout/
GET  /api/accounts/profile/
```

---

# 4. Passenger Journey

The main passenger journey is:

```text
Login
  ↓
Dashboard
  ↓
Search Rides
  ↓
Select Ride
  ↓
View Route / Ride Details
  ↓
Create Booking
  ↓
Select Payment
  ↓
Payment Verification
  ↓
Driver Accepts
  ↓
Booking Confirmed
  ↓
Track Ride / Chat
  ↓
Ride Starts
  ↓
Ride Completes
```

This is the main end-to-end product flow.

---

# 5. Dashboard

After authentication, the user reaches the GO4RYDE dashboard.

The React application routes `/` to:

```text
Dashboard.jsx
```

The dashboard provides access to the major product actions, including:

* Searching for rides
* Offering a ride
* Viewing rides
* Viewing bookings
* Profile
* Other platform features

The dashboard acts as the central navigation point for the application.

---

# 6. Offer a Ride

The **Offer a Ride** feature is implemented through:

```text
CreateRide.jsx
```

The UI provides fields such as:

* From
* To
* Date & Time
* Price per seat
* Number of seats

The flow is:

```text
Driver
  ↓
Offer a Ride
  ↓
Enter Source
  ↓
Enter Destination
  ↓
Select Date/Time
  ↓
Set Price
  ↓
Set Available Seats
  ↓
Create Ride
```

Only users with the `DRIVER` role are permitted by the backend to create rides.

The backend uses:

```text
POST /api/rides/
```

The ride stores:

* Driver
* Source
* Destination
* Source coordinates
* Destination coordinates
* Distance
* Duration
* Route geometry
* Date/time
* Price per seat
* Available seats
* Booked seats
* Ride status

---

# 7. Route Calculation

GO4RYDE integrates route calculation with Google Maps.

The backend can calculate:

* Distance
* Duration
* Route information
* Suggested price

The route calculation endpoint is:

```text
POST /api/rides/calculate-route/
```

The frontend sends:

```text
source
destination
```

The backend requests directions and returns route information.

The application also stores route geometry for displaying the route later.

---

# 8. Search for Rides

Passengers use:

```text
SearchRides.jsx
```

The page displays available rides.

The ride data contains:

* Source
* Destination
* Coordinates
* Price
* Distance
* Duration
* Remaining seats
* Date/time
* Route geometry
* Ride status

The frontend uses the ride service to request:

```text
GET /api/rides/
```

and can also use the ride-search functionality.

The search journey is:

```text
Passenger
   ↓
Enter travel information
   ↓
Search
   ↓
Available Rides
   ↓
Select Ride
   ↓
Route Preview / Ride Details
```

---

# 9. Ride Details

The product has dedicated ride-detail pages.

Relevant frontend routes include:

```text
/ride/:id
/ride/:id/route
/booking/:id
```

The passenger can see information about the selected ride and proceed toward booking.

The system connects the selected ride with:

* Driver
* Route
* Price
* Available seats
* Booking
* Payment
* Tracking
* Chat

---

# 10. Booking System

The booking backend is handled by the `bookings` Django application.

A booking contains:

* Passenger
* Ride
* Number of seats
* Original amount
* Final amount
* Coupon
* Booking status
* Payment status
* Remaining amount
* Expiration information
* Creation time

The booking process is:

```text
Select Ride
     ↓
Select Seats
     ↓
Calculate Amount
     ↓
Apply Coupon (optional)
     ↓
Create Booking
     ↓
Pending
```

The frontend uses:

```text
POST /api/bookings/create/
```

The booking response returns the booking ID and final amount.

---

# 11. Coupon / Discount System

GO4RYDE contains a dedicated `coupons` Django application.

Coupons support:

* Flat discounts
* Percentage discounts
* Minimum booking amount
* Maximum discount
* Expiry date
* Usage limit
* Per-user usage tracking
* Active/inactive state

The backend validates:

```text
Is coupon active?
        ↓
Has coupon expired?
        ↓
Is minimum amount satisfied?
        ↓
Has usage limit been reached?
        ↓
Has this user already used it?
```

Then the discount is calculated.

The API is:

```text
POST /api/coupons/apply/
```

The important point for presentation is:

**GO4RYDE does not simply display a discount — the backend validates and calculates the coupon before applying it to the booking.**

---

# 12. Payment System

Payment is one of the major components of the product.

The backend supports:

```text
FULL
PARTIAL
WALLET
COD
```

The payment model stores:

* Booking
* Razorpay order ID
* Razorpay payment ID
* Razorpay signature
* Amount
* Payment type
* Final-payment flag
* Payment status

---

# 13. Razorpay Online Payment

The online payment flow is:

```text
Passenger
    ↓
Booking Created
    ↓
Create Razorpay Order
    ↓
Razorpay Checkout
    ↓
Payment Completed
    ↓
Payment ID + Signature
    ↓
Backend Verification
    ↓
Booking Payment Updated
```

The backend exposes:

```text
POST /api/payments/create/
POST /api/payments/verify/
```

The backend verifies the Razorpay signature before treating the online payment as successful.

---

# 14. Partial Payment

The system also contains support for partial payments.

The concept is:

```text
Booking Amount
      ↓
Partial Payment
      ↓
PARTIALLY_PAID
      ↓
Remaining Amount
      ↓
Final Payment
      ↓
PAID
```

The booking model therefore maintains:

```text
remaining_amount
payment_status
```

This allows the system to distinguish between:

* unpaid booking
* partially paid booking
* fully paid booking
* cash payment

---

# 15. COD Payment

GO4RYDE also supports cash payment.

The passenger can select:

```text
COD
```

The payment record is created with the cash status and the booking payment status is updated accordingly.

The application therefore supports both:

```text
Digital Payment
       +
Cash Payment
```

---

# 16. Wallet System

The payment backend contains a complete wallet model.

A wallet belongs to one user.

```text
User
  │
  └── Wallet
        │
        ├── Balance
        │
        └── Transactions
```

Wallet transactions support:

```text
CREDIT
DEBIT
```

and sources including:

```text
PAYMENT
REFUND
WITHDRAWAL
DEPOSIT
```

---

# 17. Wallet Top-Up

The wallet can be funded using Razorpay.

Flow:

```text
Profile
   ↓
Wallet
   ↓
Add Money
   ↓
Create Razorpay Order
   ↓
Complete Payment
   ↓
Verify Payment
   ↓
Wallet Balance Increased
   ↓
Transaction Created
```

The backend endpoints are:

```text
POST /api/payments/wallet/topup/
POST /api/payments/wallet/verify/
```

---

# 18. Wallet Payment for Ride

The wallet can also be used directly for booking payment.

Flow:

```text
Wallet Balance
      ↓
Check Balance
      ↓
Sufficient Balance?
      ↓
Yes
      ↓
Debit Wallet
      ↓
Create Payment
      ↓
Booking Payment Updated
```

The system records the wallet debit as a transaction.

---

# 19. Bank Account & Withdrawal

GO4RYDE includes bank-account information for withdrawals.

The user can provide:

* Account holder name
* Bank name
* Account number
* IFSC
* Optional UPI ID

The backend stores this in the `BankAccount` model.

Withdrawal flow:

```text
Wallet
  ↓
Enter Withdrawal Amount
  ↓
Check Balance
  ↓
Select/Save Bank Account
  ↓
Create Withdrawal
  ↓
PENDING
  ↓
Admin / payout processing
  ↓
APPROVED / PAID / REJECTED
```

The frontend includes:

```text
MyWithdrawals.jsx
```

for withdrawal history.

---

# 20. Driver Wallet

The payment implementation also credits the driver's wallet when eligible payment processing succeeds.

Conceptually:

```text
Passenger Payment
       ↓
Payment Verification
       ↓
Booking Payment Success
       ↓
Driver Wallet
       ↓
Wallet Transaction CREDIT
```

This provides the foundation for the driver earnings side of GO4RYDE.

---

# 21. Driver Booking Acceptance

Once a passenger creates and pays for a booking, the driver can accept it.

The backend validates:

* The requester is the ride driver.
* The booking is still pending.
* Payment has been initiated/completed according to the supported payment state.
* Seats are still available.

Then:

```text
PENDING
   ↓
Driver Accepts
   ↓
CONFIRMED
```

Seats are locked/booked during acceptance.

This is an important business rule because two passengers should not be able to consume the same remaining seat.

---

# 22. Ride Lifecycle

The intended ride lifecycle is:

```text
CREATED
   ↓
Booking
   ↓
CONFIRMED
   ↓
STARTED / ACTIVE
   ↓
COMPLETED
```

Cancellation is also supported:

```text
CREATED / BOOKING
       ↓
CANCELLED
```

The booking lifecycle separately contains states such as:

```text
PENDING
ACCEPTED
CONFIRMED
STARTED
CANCELLED
```

The frontend provides pages for both driver rides and passenger bookings.

---

# 23. My Rides — Driver Side

The driver can access:

```text
/my-rides
```

through:

```text
MyRides.jsx
```

The backend returns the driver's rides along with booking/passenger information.

The driver can see information such as:

* Ride
* Source
* Destination
* Date/time
* Ride status
* Number of bookings
* Passenger details
* Passenger phone information
* Booking status

This is the main driver-management area of the website.

---

# 24. My Bookings — Passenger Side

Passengers use:

```text
/my-bookings
```

The page is implemented through:

```text
MyBookings.jsx
```

A booking contains information such as:

* Booking ID
* Ride
* Amount
* Booking status
* Payment status
* Ride status
* Driver name
* Driver phone

From a booking the passenger can access:

```text
Payment
Tracking
Chat
Booking details
Cancellation
```

---

# 25. Live Tracking

GO4RYDE includes a tracking subsystem.

The backend maintains:

```text
DriverLocation
DriverLocationHistory
```

The current driver position stores:

```text
Latitude
Longitude
Heading
Speed
Updated time
```

The history model stores previous location points.

The tracking API includes:

```text
POST /api/tracking/update-location/
GET  /api/tracking/driver-location/<ride_id>/
```

The frontend contains:

```text
TrackingPage.jsx
```

The current frontend implementation requests the driver's location periodically and refreshes the displayed location.

---

# 26. Ride Chat

The platform contains a booking-based chat system.

A chat room connects:

```text
Driver
   ↕
Passenger
```

Messages contain:

* Sender
* Message
* Delivery state
* Read state
* Timestamp

The backend provides:

```text
GET  /api/chat/<booking_id>/
POST /api/chat/send/<booking_id>/
POST /api/chat/read/<booking_id>/
```

The frontend provides:

```text
/chat/:bookingId
```

through:

```text
RideChatPage.jsx
```

The backend also contains Channels/WebSocket infrastructure for real-time functionality.

---

# 27. Notifications

GO4RYDE has a dedicated notification system.

Notification types include:

```text
BOOKING
PAYMENT
WALLET
WITHDRAWAL
CHAT
RIDE
SYSTEM
```

Notifications have:

* Title
* Message
* Type
* Priority
* Read/unread state
* Metadata
* Creation timestamp

The frontend contains:

```text
Notifications.jsx
NotificationBell.jsx
useNotifications.js
```

The user can:

```text
View notifications
        ↓
Open notification
        ↓
Navigate to related feature
        ↓
Mark as read
```

---

# 28. Profile

The profile page acts as a user-management hub.

It contains functionality around:

* Account
* Bookings
* Driver upgrade
* My rides
* Bank account
* Wallet/withdrawal
* Driver information

The driver upgrade process collects driver information such as:

* Driving licence image
* RC image
* Driver profile image
* Vehicle number

This creates the foundation for driver verification.

---

# 29. Admin

The backend includes Django Admin and JET dashboard configuration.

The backend routes include:

```text
/admin/
```

and JET dashboard routes.

The project structure also includes admin registrations for the major applications.

This provides the administration layer for managing platform data and operations.

---

# 30. Frontend Route Map

The React website contains the following major routes:

```text
/login
/
 /profile
 /create-ride
 /rides
 /my-rides
 /my-bookings
 /booking/:id
 /payment/:id
 /payment/success
 /payment/failed
 /wallet/withdrawals
 /tracking/:rideId
 /chat/:bookingId
 /notifications
 /route-preview
 /ride/:id/route
 /ride/:id
```

The application uses a shared layout containing the navigation bar for authenticated pages.

---

# 31. Frontend Architecture

The frontend is divided into:

```text
src/
│
├── api/
│   ├── bookingService.js
│   ├── chatService.js
│   ├── couponService.js
│   ├── paymentService.js
│   └── rideService.js
│
├── components/
│   ├── Navbar
│   ├── MapView
│   ├── LocationSearch
│   ├── RideSearchForm
│   ├── ChatBox
│   └── NotificationBell
│
├── pages/
│   ├── AuthPage
│   ├── Dashboard
│   ├── CreateRide
│   ├── SearchRides
│   ├── RideDetails
│   ├── MyRides
│   ├── MyBookings
│   ├── PaymentPage
│   ├── TrackingPage
│   ├── RideChatPage
│   ├── ProfilePage
│   └── Notifications
│
├── services/
│
├── context/
│
├── hooks/
│
└── utils/
```

This separates:

```text
UI
 ↓
Service/API layer
 ↓
Django REST API
```

---

# 32. Complete Passenger Demo

For a final demonstration, use this sequence.

### Step 1 — Login

Open GO4RYDE.

```text
Login
 ↓
Enter email/phone
 ↓
OTP
 ↓
Verify
```

### Step 2 — Search

Go to:

```text
Search Rides
```

Enter:

```text
Source
Destination
```

View available rides.

### Step 3 — Select Ride

Open a ride.

Show:

* Driver
* Route
* Price
* Seats
* Date/time

### Step 4 — Book

Select the number of seats.

Apply a coupon if available.

Create the booking.

### Step 5 — Payment

Demonstrate one of:

```text
Razorpay
Wallet
COD
Partial Payment
```

### Step 6 — Driver Accepts

Switch to the driver account.

Open:

```text
My Rides
```

Accept the booking.

The passenger's booking becomes:

```text
CONFIRMED
```

### Step 7 — Chat

Open the booking chat.

Demonstrate:

```text
Driver ↔ Passenger
```

### Step 8 — Start Ride

Driver starts the ride.

Booking becomes:

```text
STARTED
```

Tracking becomes available.

### Step 9 — Tracking

Passenger opens:

```text
Track Ride
```

The application requests the driver's current location.

### Step 10 — Complete Ride

Driver ends the ride.

The booking and ride move toward:

```text
COMPLETED
```

### Step 11 — Earnings

Show the driver's wallet/transaction side.

---

# 33. Complete Driver Demo

The driver journey can be presented as:

```text
Driver Login
     ↓
Driver Profile
     ↓
Offer a Ride
     ↓
Source + Destination
     ↓
Date/Time
     ↓
Price
     ↓
Seats
     ↓
Ride Created
     ↓
Passenger Booking
     ↓
Payment
     ↓
Accept Booking
     ↓
Confirmed
     ↓
Start Ride
     ↓
Live Tracking
     ↓
Complete Ride
     ↓
Driver Earnings / Wallet
```

---

# 34. Website vs Mobile Application

## Website

The uploaded `restored-mar29-state` branch contains the complete React web frontend.

The web application includes:

* Authentication
* Dashboard
* Ride creation
* Ride search
* Ride details
* Booking
* Payments
* Wallet-related pages
* Withdrawals
* Tracking
* Chat
* Notifications
* Profile
* Driver functionality

## Mobile Application

The uploaded branch **does not contain a React Native/mobile application source tree**.

Therefore, mobile screens, mobile navigation, mobile API integration, and mobile-specific UI cannot honestly be documented as implemented in this particular branch.

For the final presentation, the mobile application should be documented separately from the mobile repository/source tree rather than claiming that it exists inside this ZIP.

---

# 35. Important Branch Findings

There are a few implementation details worth knowing before calling this branch a production-ready final build.

### Database configuration

The README describes PostgreSQL/PostGIS, but the inspected `settings.py` currently uses SQLite.

Therefore:

```text
Documentation → PostgreSQL/PostGIS
Current local settings → SQLite
```

These should be aligned before production deployment.

### Ride status consistency

The ride model defines statuses such as:

```text
CREATED
STARTED
COMPLETED
CANCELLED
```

while parts of the ride-start implementation assign:

```text
ACTIVE
```

That should be normalized before production.

### Chat implementation

The booking flow creates chat rooms using the booking relationship, while another ride-related function contains an older chat-room pattern. These implementations should be consolidated so there is one consistent chat architecture.

### Security configuration

The inspected settings file contains hardcoded credentials/API keys.

For the final deployment:

```text
Secrets
   ↓
Environment variables / secret manager
```

should replace hardcoded credentials.

Any credentials committed to a public repository should also be rotated.

---

# 36. Final Product Architecture

The clean way to explain GO4RYDE in a viva is:

```text
                    USER
                     │
          ┌──────────┴──────────┐
          │                     │
      Passenger               Driver
          │                     │
          └──────────┬──────────┘
                     │
              React Website
                     │
                  Axios
                     │
               JWT Authentication
                     │
              Django REST API
                     │
     ┌───────────────┼────────────────┐
     │               │                │
  Accounts         Rides           Bookings
     │               │                │
     └───────────────┼────────────────┘
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   Payments       Coupons        Chat
       │             │             │
       ├─────────────┼─────────────┤
       │             │             │
    Wallet       Notifications   Tracking
       │
    Razorpay
       │
   Payment Gateway
```

---

# 37. One-Minute Project Explanation

> **GO4RYDE is a smart carpooling platform that connects passengers with drivers who have available seats. The platform uses a Django REST backend and a React web frontend. Users authenticate through OTP and JWT, and they can operate as passengers or drivers. Drivers can offer rides by specifying their source, destination, timing, price, and available seats. Passengers can search available rides, create bookings, apply coupons, and complete payments using Razorpay, wallet, partial payment, or cash. After payment and driver acceptance, the booking is confirmed. The platform also provides driver tracking, passenger-driver chat, notifications, wallet management, withdrawals, and an administration layer.**

---

# 38. Final Demonstration Order

For the strongest project demonstration, use this order:

```text
1. Landing / Login
       ↓
2. OTP Authentication
       ↓
3. Passenger Dashboard
       ↓
4. Search Ride
       ↓
5. Map / Route
       ↓
6. Ride Details
       ↓
7. Booking
       ↓
8. Coupon
       ↓
9. Payment
       ↓
10. Driver Dashboard
       ↓
11. Accept Booking
       ↓
12. Chat
       ↓
13. Start Ride
       ↓
14. Live Tracking
       ↓
15. Complete Ride
       ↓
16. Wallet / Earnings
       ↓
17. Notifications
       ↓
18. Admin Dashboard
```

This tells the complete story of GO4RYDE from **authentication → ride discovery → booking → payment → driver acceptance → ride execution → tracking → completion → wallet**.
