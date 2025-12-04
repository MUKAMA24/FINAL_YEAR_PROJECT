# Quick Deployment Guide

This guide will get your application deployed in under 10 minutes.

## Prerequisites

- GitHub account
- Render account (sign up at https://render.com)
- Vercel account (sign up at https://vercel.com)
- Stripe account (for payments)
- Gmail account with App Password (for emails)

## Step 1: Deploy Backend on Render (5 minutes)

### Create Database First:

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - Name: `appointment-booking-db`
   - Database: `appointment_db`
   - User: `appointment_user`
   - Region: Choose nearest to you
   - Plan: Free (or your choice)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (starts with `postgresql://`)

### Deploy Backend:

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository
3. Render will detect `render.yaml` - click **"Apply"**
4. Go to your new web service → **Environment** tab
5. Add these environment variables:
   ```
   DATABASE_URL=<paste Internal Database URL from above>
   JWT_SECRET=<generate random 32+ character string>
   JWT_EXPIRES_IN=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-gmail@gmail.com>
   EMAIL_PASS=<your Gmail App Password>
   STRIPE_SECRET_KEY=<from Stripe Dashboard>
   STRIPE_WEBHOOK_SECRET=<from Stripe Webhooks>
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
   
   **Note**: For Gmail App Password:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Go to App Passwords → Generate new password
   - Use that password for EMAIL_PASS

6. Click **"Save Changes"** and wait for deployment
7. Once deployed, click **"Shell"** and run:
   ```bash
   node database/migrate.js
   ```

8. Your backend is now live! Note the URL (e.g., `https://your-app.onrender.com`)

## Step 2: Deploy Frontend on Vercel (3 minutes)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - Framework: Next.js (auto-detected)
   - Keep all defaults (vercel.json handles everything)
5. Click **"Environment Variables"**
6. Add these variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<from Stripe Dashboard>
   ```
   
   **Important**: Replace `your-backend.onrender.com` with your actual Render backend URL

7. Click **"Deploy"**
8. Wait for deployment to complete
9. Your frontend is live! Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

## Step 3: Update Backend with Frontend URL (1 minute)

1. Go back to Render Dashboard
2. Open your backend web service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Click **"Save Changes"** (service will auto-restart)

## Step 4: Configure Stripe Webhooks (1 minute)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-backend.onrender.com/api/payments/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to Render backend as `STRIPE_WEBHOOK_SECRET` environment variable

## Verify Deployment

### Test Backend:
```bash
curl https://your-backend.onrender.com/api/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2024-..."
}
```

### Test Frontend:
1. Open your Vercel URL in browser
2. Try creating an account
3. If everything works, you're done! 🎉

## Common Issues

### Backend won't start?
- Check all environment variables are set
- Verify DATABASE_URL is the **Internal** URL
- Check Render logs for errors

### Frontend can't reach backend?
- Verify `NEXT_PUBLIC_API_URL` has `/api` at the end
- Check `FRONTEND_URL` in backend matches your Vercel URL
- Open browser console to see CORS errors

### Database connection failed?
- Use **Internal Database URL**, not External
- Ensure database and web service are in same region
- Run migrations: `node database/migrate.js` in Render Shell

### Still having issues?
Check the detailed troubleshooting guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

## Optional: Seed Sample Data

In Render Shell, run:
```bash
node database/seed.js
```

This adds sample businesses, services, and users for testing.

## What's Next?

- Set up custom domain (both Render and Vercel support this)
- Configure monitoring and alerts
- Set up automated backups
- Review security settings

Congratulations! Your appointment booking platform is now live! 🚀
