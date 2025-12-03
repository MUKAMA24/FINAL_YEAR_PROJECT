# 🚀 Quick Start Guide - Appointment Booking Platform

## What You've Built

A full-stack appointment booking system with:
- ✅ Customer booking interface
- ✅ Business management dashboard
- ✅ Real-time availability management
- ✅ Payment processing (Stripe integration)
- ✅ Email notifications
- ✅ Reviews & ratings system
- ✅ Admin panel

## 📋 Installation Steps

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Install Frontend Dependencies

```powershell
cd ..\frontend
npm install
```

### Step 3: Setup PostgreSQL Database

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create Database**:
   ```sql
   -- Open pgAdmin or psql
   CREATE DATABASE appointment_db;
   ```

### Step 4: Configure Backend Environment

```powershell
cd ..\backend
copy .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/appointment_db
JWT_SECRET=my_super_secret_jwt_key_2024
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
STRIPE_SECRET_KEY=sk_test_your_key
PORT=5000
NODE_ENV=development
```

### Step 5: Run Database Migrations

```powershell
# Still in backend directory
npm run migrate
```

### Step 6: Seed Test Data (Optional)

```powershell
npm run seed
```

This creates test accounts:
- Customer: `customer@test.com` / `password123`
- Business: `barber@test.com` / `password123`
- Admin: `admin@appointment.com` / `password123`

### Step 7: Configure Frontend Environment

```powershell
cd ..\frontend
copy .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_key
```

### Step 8: Start the Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Server starts on http://localhost:5000

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend starts on http://localhost:3000

## 🎯 Testing the Application

### 1. Test Customer Flow

1. Open http://localhost:3000
2. Click "Sign Up" → Create customer account
3. Browse businesses
4. Select a business → Choose service → Pick time slot
5. Complete booking
6. View "My Bookings"

### 2. Test Business Flow

1. Login with `barber@test.com` / `password123`
2. View Dashboard
3. Add services
4. View bookings
5. Complete bookings

### 3. Test Admin Flow

1. Login with `admin@appointment.com` / `password123`
2. View all businesses
3. Approve/reject businesses
4. View statistics

## 📧 Email Setup (Gmail)

1. **Enable 2-Factor Authentication**:
   - Go to Google Account → Security
   - Turn on 2-Step Verification

2. **Generate App Password**:
   - Security → 2-Step Verification → App Passwords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update .env**:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop  # Remove spaces
   ```

## 💳 Stripe Setup (Optional)

1. **Create Account**: https://dashboard.stripe.com/register
2. **Get Test Keys**: Dashboard → Developers → API keys
3. **Add to Environment**:
   - Backend `.env`: Secret key (sk_test_...)
   - Frontend `.env.local`: Publishable key (pk_test_...)

## 🔧 Troubleshooting

### Database Connection Error
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Verify connection
psql -U postgres -d appointment_db
```

### Port Already in Use
```powershell
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found
```powershell
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

### TypeScript Errors in Frontend
```powershell
cd frontend
npm install --save-dev typescript @types/react @types/node
```

## 📱 Key Features to Test

### ✅ Authentication
- [ ] Sign up as customer
- [ ] Sign up as business
- [ ] Login/Logout
- [ ] Token persistence

### ✅ Business Management
- [ ] Create business profile
- [ ] Add services
- [ ] Add time slots
- [ ] View bookings
- [ ] Complete bookings

### ✅ Customer Booking
- [ ] Search businesses
- [ ] View business details
- [ ] Select service and time
- [ ] Create booking
- [ ] View booking details
- [ ] Cancel booking

### ✅ Reviews
- [ ] Submit review after completed booking
- [ ] View business reviews
- [ ] Rating calculation

### ✅ Admin Panel
- [ ] View all businesses
- [ ] Approve businesses
- [ ] View statistics

## 📊 Database Quick Reference

```sql
-- View all users
SELECT * FROM users;

-- View all businesses
SELECT * FROM businesses;

-- View all bookings
SELECT 
  b.id, 
  u.name as customer, 
  bus.name as business, 
  s.service_name,
  ts.start_time,
  b.status
FROM bookings b
JOIN users u ON b.customer_id = u.id
JOIN businesses bus ON b.business_id = bus.id
JOIN services s ON b.service_id = s.id
JOIN time_slots ts ON b.timeslot_id = ts.id;

-- Reset all time slots
UPDATE time_slots SET is_booked = false;

-- Make all businesses approved
UPDATE businesses SET is_approved = true;
```

## 🎨 Customization

### Change Primary Color

Edit `frontend/tailwind.config.js`:
```js
colors: {
  primary: {
    // Change these hex values
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

### Add New Category

1. Update categories in `frontend/pages/index.tsx`
2. No database changes needed

### Modify Email Templates

Edit `backend/utils/email.js` - Update HTML templates

## 📚 Project Structure

```
mukama/
├── backend/                 # Express API
│   ├── config/             # Database config
│   ├── database/           # Migrations & seeds
│   ├── middleware/         # Auth middleware
│   ├── routes/            # API endpoints
│   ├── utils/             # Helpers (email, payments)
│   └── server.js          # Entry point
│
├── frontend/               # Next.js App
│   ├── components/        # React components
│   ├── context/          # Auth context
│   ├── lib/              # API client
│   ├── pages/            # Routes
│   │   ├── index.tsx     # Home
│   │   ├── login.tsx     # Login
│   │   ├── signup.tsx    # Registration
│   │   ├── dashboard.tsx # Business dashboard
│   │   ├── my-bookings.tsx # Customer bookings
│   │   ├── business/[id].tsx # Business profile
│   │   └── booking/      # Booking pages
│   └── styles/           # Global CSS
│
├── README.md              # Overview
├── SETUP.md              # Detailed setup
├── API_DOCUMENTATION.md  # API docs
└── DEPLOYMENT.md         # Deploy guide
```

## 🚀 Next Steps

1. ✅ Application is running locally
2. Test all features thoroughly
3. Configure Stripe for payments
4. Setup email notifications
5. Review API documentation
6. Plan deployment (see DEPLOYMENT.md)
7. Add custom features

## 💡 Tips

- **Use test data**: Run `npm run seed` to populate test accounts
- **Clear browser cache**: If login issues occur
- **Check console logs**: Both browser and terminal for errors
- **Use Postman**: Test API endpoints directly
- **Database GUI**: Use pgAdmin or DBeaver to view data

## 📞 Support

- Check API_DOCUMENTATION.md for endpoint details
- Review SETUP.md for detailed configuration
- See DEPLOYMENT.md for production setup

---

**🎉 Congratulations! Your appointment booking platform is ready!**

Start the servers and visit: http://localhost:3000
