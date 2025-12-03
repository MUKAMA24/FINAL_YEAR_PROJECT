# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Home Page   │  │   Business   │  │   Customer   │        │
│  │   Search     │  │   Dashboard  │  │   Bookings   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│                    Next.js Frontend (Port 3000)                 │
│                    React + TypeScript + Tailwind                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS (REST API)
                              │ JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND (Port 5000)               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    API ROUTES                             │ │
│  │  /auth  /businesses  /services  /bookings  /reviews      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    MIDDLEWARE                             │ │
│  │  Authentication │ Validation │ Error Handling            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    UTILITIES                              │ │
│  │  Email Service │ Payment Processing │ JWT Tokens         │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   PostgreSQL   │  │  Email Service │  │     Stripe     │
│    Database    │  │   (Nodemailer) │  │    Payment     │
│                │  │                │  │                │
│ • users        │  │ • Confirmations│  │ • Payments     │
│ • businesses   │  │ • Reminders    │  │ • Refunds      │
│ • services     │  │ • Cancellations│  │ • Webhooks     │
│ • time_slots   │  └────────────────┘  └────────────────┘
│ • bookings     │
│ • payments     │
│ • reviews      │
└────────────────┘
```

## Data Flow

### 1. User Authentication Flow

```
User (Browser)
    │
    │ 1. Enter credentials
    ▼
Login Page (Next.js)
    │
    │ 2. POST /api/auth/login
    ▼
Auth Routes (Express)
    │
    │ 3. Verify credentials
    ▼
Database (PostgreSQL)
    │
    │ 4. User data
    ▼
Auth Routes
    │
    │ 5. Generate JWT token
    ▼
Login Page
    │
    │ 6. Store token & redirect
    ▼
Dashboard/Home
```

### 2. Booking Creation Flow

```
Customer
    │
    │ 1. Browse businesses
    ▼
Business Profile Page
    │
    │ 2. Select service
    ▼
Service Selection
    │
    │ 3. Choose time slot
    ▼
Time Slot Picker
    │
    │ 4. Confirm booking
    ▼
API: POST /api/bookings
    │
    ├─ 5a. Create booking record
    ├─ 5b. Mark time slot as booked
    ├─ 5c. Create payment record
    └─ 5d. Send confirmation email
    │
    ▼
Booking Confirmation Page
    │
    └─ Email sent to customer
```

### 3. Business Dashboard Flow

```
Business Owner
    │
    │ 1. Login
    ▼
Dashboard Page
    │
    ├─ GET /api/businesses/my/profile
    │   └─ Fetch business info & services
    │
    ├─ GET /api/bookings/business/:id
    │   └─ Fetch all bookings
    │
    └─ Display:
        ├─ Upcoming appointments
        ├─ Services list
        └─ Business profile
```

## Component Architecture

### Frontend (Next.js)

```
pages/
│
├── _app.tsx                 → App wrapper with AuthProvider
│   └── Layout               → Navigation + Footer
│       └── Page Content
│
├── index.tsx                → Home with search
│   ├── Hero Section
│   ├── Search Bar
│   └── Featured Businesses
│
├── business/[id].tsx        → Business Profile
│   ├── Business Info
│   ├── Services List
│   ├── Reviews
│   └── Booking Panel
│       ├── Service Selector
│       └── Time Slot Picker
│
├── dashboard.tsx            → Business Dashboard
│   ├── Tabs (Bookings/Services/Profile)
│   ├── Bookings Table
│   └── Services Management
│
└── my-bookings.tsx          → Customer Bookings
    ├── Filter Tabs
    └── Bookings List
```

### Backend (Express)

```
server.js
    │
    ├── Middleware Setup
    │   ├── CORS
    │   ├── Body Parser
    │   └── Morgan (Logging)
    │
    ├── Routes
    │   ├── /api/auth           → Authentication
    │   ├── /api/businesses     → Business CRUD
    │   ├── /api/services       → Service management
    │   ├── /api/timeslots      → Availability
    │   ├── /api/bookings       → Booking system
    │   ├── /api/reviews        → Review system
    │   └── /api/admin          → Admin panel
    │
    └── Error Handler
```

## Database Relationships

```
users (1) ─────────< (N) businesses
                          │
                          │ (1)
                          │
                          ▼
                     (N) services
                          │
                          │ (1)
                          │
                          ▼
                     (N) time_slots


bookings (N) ──────> (1) users (customer)
         (N) ──────> (1) businesses
         (N) ──────> (1) services
         (N) ──────> (1) time_slots
         (1) ──────< (1) payments
         (1) ──────< (1) reviews
```

## Authentication Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Check Authorization │
│      Header         │
└──────┬──────────────┘
       │
       ├─ No Token? ──> 401 Unauthorized
       │
       ▼
┌─────────────────────┐
│   Verify JWT Token  │
└──────┬──────────────┘
       │
       ├─ Invalid? ──> 401 Invalid Token
       │
       ▼
┌─────────────────────┐
│  Fetch User from DB │
└──────┬──────────────┘
       │
       ├─ Not Found? ──> 401 User Not Found
       │
       ▼
┌─────────────────────┐
│  Check User Role    │
└──────┬──────────────┘
       │
       ├─ No Permission? ──> 403 Forbidden
       │
       ▼
┌─────────────────────┐
│  Process Request    │
└─────────────────────┘
```

## API Request/Response Cycle

```
1. Client Request
   ↓
   GET /api/businesses/123
   Headers: { Authorization: Bearer <token> }

2. Server Processing
   ↓
   ├─ Middleware: authMiddleware
   ├─ Route: businessRoutes
   ├─ Controller: getBusinessById
   ├─ Database: Query businesses table
   └─ Response: JSON data

3. Client Response
   ↓
   {
     "id": 123,
     "name": "Classic Cuts",
     "services": [...]
   }
```

## State Management (Frontend)

```
AuthContext
    │
    ├─ user: User | null
    ├─ loading: boolean
    ├─ login(email, password)
    ├─ signup(data)
    └─ logout()
        │
        └─ Used by:
            ├─ Navbar
            ├─ Dashboard
            ├─ My Bookings
            └─ Protected Pages
```

## Email Notification Flow

```
Booking Created
    │
    ▼
sendBookingConfirmation()
    │
    ├─ Fetch booking details
    ├─ Generate HTML email
    └─ Send via Nodemailer
        │
        ▼
    SMTP Server (Gmail)
        │
        ▼
    Customer's Email
```

## Payment Processing Flow

```
1. Customer initiates booking
   ↓
2. Create Stripe Payment Intent
   ↓
3. Return client_secret to frontend
   ↓
4. Customer confirms payment (Stripe.js)
   ↓
5. Webhook receives payment_succeeded
   ↓
6. Update payment status in database
   ↓
7. Send confirmation email
```

## Security Layers

```
┌─────────────────────────────┐
│    Input Validation         │ ← express-validator
├─────────────────────────────┤
│    Authentication           │ ← JWT tokens
├─────────────────────────────┤
│    Authorization            │ ← Role-based access
├─────────────────────────────┤
│    Password Hashing         │ ← bcryptjs
├─────────────────────────────┤
│    SQL Injection Protection │ ← Parameterized queries
├─────────────────────────────┤
│    CORS Configuration       │ ← cors middleware
└─────────────────────────────┘
```

## Deployment Architecture (Production)

```
┌─────────────────────┐
│   Vercel (Frontend) │
│   Next.js App       │
│   Port: 443 (HTTPS) │
└──────────┬──────────┘
           │
           │ API Calls
           ▼
┌─────────────────────┐
│   Render (Backend)  │
│   Express Server    │
│   Port: 443 (HTTPS) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Render PostgreSQL   │
│   Database          │
└─────────────────────┘

External Services:
├─ Gmail SMTP (Email)
└─ Stripe (Payments)
```

## Performance Optimizations

```
Backend:
├─ Database Indexes on foreign keys
├─ Pagination for large datasets
├─ Connection pooling (pg-promise)
└─ Query optimization

Frontend:
├─ Static page generation (Next.js)
├─ Image optimization
├─ Code splitting
└─ Lazy loading components
```

---

This architecture provides:
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ Separation of concerns
- ✅ Clean code organization
