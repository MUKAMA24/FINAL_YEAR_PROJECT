# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User
```http
POST /auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## Business Endpoints

### Get All Businesses
```http
GET /businesses?category=barber&city=NewYork&search=classic&page=1&limit=10
```

**Query Parameters:**
- `category` (optional): Filter by category
- `city` (optional): Filter by city
- `search` (optional): Search in name and description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### Get Business by ID
```http
GET /businesses/:id
```

### Create/Update Business (Auth Required - Business Role)
```http
POST /businesses
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Classic Cuts Barbershop",
  "description": "Professional barbershop",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "category": "barber",
  "contact_info": "contact@classiccuts.com",
  "image_url": "https://example.com/image.jpg"
}
```

---

## Service Endpoints

### Get Services for Business
```http
GET /services/:business_id
```

### Add Service (Auth Required - Business Role)
```http
POST /services
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "service_name": "Classic Haircut",
  "description": "Traditional haircut with styling",
  "price": 30.00,
  "duration": 30
}
```

### Update Service (Auth Required - Business Role)
```http
PUT /services/:id
Authorization: Bearer <token>
```

### Delete Service (Auth Required - Business Role)
```http
DELETE /services/:id
Authorization: Bearer <token>
```

---

## Time Slot Endpoints

### Get Available Time Slots
```http
GET /timeslots/:service_id?date=2024-01-15
```

**Query Parameters:**
- `date` (optional): Specific date (YYYY-MM-DD)
- `start_date` (optional): Range start date
- `end_date` (optional): Range end date

### Add Time Slot (Auth Required - Business Role)
```http
POST /timeslots
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "service_id": 1,
  "start_time": "2024-01-15T10:00:00Z",
  "end_time": "2024-01-15T10:30:00Z"
}
```

### Bulk Add Time Slots (Auth Required - Business Role)
```http
POST /timeslots/bulk
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "service_id": 1,
  "slots": [
    {
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": "2024-01-15T10:30:00Z"
    },
    {
      "start_time": "2024-01-15T11:00:00Z",
      "end_time": "2024-01-15T11:30:00Z"
    }
  ]
}
```

---

## Booking Endpoints

### Create Booking (Auth Required)
```http
POST /bookings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "business_id": 1,
  "service_id": 1,
  "timeslot_id": 5,
  "customer_notes": "Please call before arriving"
}
```

### Get Booking Details (Auth Required)
```http
GET /bookings/:id
Authorization: Bearer <token>
```

### Get Customer's Bookings (Auth Required)
```http
GET /bookings/customer/my?status=booked
Authorization: Bearer <token>
```

### Get Business Bookings (Auth Required - Business Role)
```http
GET /bookings/business/:business_id?status=booked&date=2024-01-15
Authorization: Bearer <token>
```

### Cancel Booking (Auth Required)
```http
PUT /bookings/:id/cancel
Authorization: Bearer <token>
```

### Complete Booking (Auth Required - Business Role)
```http
PUT /bookings/:id/complete
Authorization: Bearer <token>
```

---

## Review Endpoints

### Create Review (Auth Required)
```http
POST /reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "booking_id": 1,
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Get Business Reviews
```http
GET /reviews/business/:business_id?page=1&limit=10
```

### Get My Reviews (Auth Required)
```http
GET /reviews/my
Authorization: Bearer <token>
```

---

## Admin Endpoints (Auth Required - Admin Role)

### Get All Businesses
```http
GET /admin/businesses?is_approved=false&page=1&limit=20
Authorization: Bearer <token>
```

### Approve/Reject Business
```http
PUT /admin/businesses/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "is_approved": true
}
```

### Get Platform Statistics
```http
GET /admin/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "stats": {
    "total_customers": 150,
    "total_businesses": 45,
    "approved_businesses": 40,
    "total_bookings": 320,
    "completed_bookings": 280,
    "total_revenue": "8400.00"
  }
}
```

### Get All Users
```http
GET /admin/users?role=customer&page=1&limit=50
Authorization: Bearer <token>
```

### Get All Bookings
```http
GET /admin/bookings?status=booked&page=1&limit=50
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Development**: No rate limiting
- **Production**: 100 requests per 15 minutes per IP

---

## Webhooks (Stripe)

Configure webhook endpoint for payment events:
```
POST /webhooks/stripe
```

Supported events:
- `payment_intent.succeeded`
- `payment_intent.failed`
- `charge.refunded`
