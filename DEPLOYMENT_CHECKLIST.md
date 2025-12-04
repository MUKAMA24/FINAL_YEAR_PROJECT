# Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment Preparation

### Accounts Setup
- [ ] Create Render account (https://render.com)
- [ ] Create Vercel account (https://vercel.com)
- [ ] Create Stripe account (https://stripe.com)
- [ ] Set up Gmail App Password for emails

### Credentials Collection
- [ ] Stripe Secret Key (`sk_...`)
- [ ] Stripe Public Key (`pk_...`)
- [ ] Gmail email address
- [ ] Gmail App Password (not regular password!)
- [ ] Generated JWT_SECRET (32+ random characters)

## Backend Deployment (Render)

### Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Copy Internal Database URL
- [ ] Verify database is running (green checkmark)

### Web Service Setup
- [ ] Deploy using render.yaml blueprint OR manual setup
- [ ] Set rootDir to `backend` (if manual)
- [ ] Configure build command: `npm install --production=false`
- [ ] Configure start command: `node server.js`
- [ ] Set health check path: `/api/health`

### Environment Variables (Backend)
- [ ] `DATABASE_URL` - Internal PostgreSQL URL from above
- [ ] `JWT_SECRET` - Random 32+ character string
- [ ] `JWT_EXPIRES_IN` - Set to `7d`
- [ ] `EMAIL_HOST` - Set to `smtp.gmail.com`
- [ ] `EMAIL_PORT` - Set to `587`
- [ ] `EMAIL_USER` - Your Gmail address
- [ ] `EMAIL_PASS` - Gmail App Password (NOT regular password)
- [ ] `STRIPE_SECRET_KEY` - From Stripe dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` - Will set this later
- [ ] `FRONTEND_URL` - Will update after frontend deploys
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Set to `5000` (or leave empty for auto-assign)

### Post-Deployment
- [ ] Wait for successful deployment
- [ ] Open Render Shell
- [ ] Run database migrations: `node database/migrate.js`
- [ ] (Optional) Seed data: `node database/seed.js`
- [ ] Test health endpoint: `curl https://your-backend.onrender.com/api/health`
- [ ] Copy backend URL for frontend configuration

## Frontend Deployment (Vercel)

### Project Setup
- [ ] Import GitHub repository to Vercel
- [ ] Verify Next.js framework is auto-detected
- [ ] Keep default settings (vercel.json handles config)

### Environment Variables (Frontend)
- [ ] `NEXT_PUBLIC_API_URL` - Your Render backend URL + `/api`
  - Example: `https://your-backend.onrender.com/api`
  - **Important**: Must end with `/api`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key

### Post-Deployment
- [ ] Wait for successful build and deployment
- [ ] Copy Vercel frontend URL
- [ ] Test frontend loads in browser
- [ ] Check browser console for errors

## Integration & Configuration

### Update Backend CORS
- [ ] Go to Render backend environment settings
- [ ] Update `FRONTEND_URL` with your Vercel URL
- [ ] Example: `https://your-app.vercel.app` (no trailing slash)
- [ ] Save and wait for service restart

### Configure Stripe Webhooks
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Add endpoint: `https://your-backend.onrender.com/api/payments/webhook`
- [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy webhook signing secret (`whsec_...`)
- [ ] Add to Render as `STRIPE_WEBHOOK_SECRET`
- [ ] Save and wait for service restart

## Testing & Verification

### Backend Tests
- [ ] Health check responds: `https://your-backend.onrender.com/api/health`
- [ ] Response shows `"database": "connected"`
- [ ] Root endpoint works: `https://your-backend.onrender.com/`
- [ ] SSL certificate is active (shows padlock in browser)

### Frontend Tests
- [ ] Homepage loads without errors
- [ ] Open browser console - no errors
- [ ] Network tab shows API calls work
- [ ] SSL certificate is active

### Integration Tests
- [ ] Create a new customer account
- [ ] Login with created account
- [ ] Browse businesses (if seeded)
- [ ] Test booking flow (without payment)
- [ ] Verify email notifications work
- [ ] Logout and login again

### Payment Tests (Use Stripe Test Mode)
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete a test booking with payment
- [ ] Verify webhook received in Stripe dashboard
- [ ] Check payment status in database

## Security Verification

- [ ] All environment variables are set (no defaults in code)
- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] Using Gmail App Password (not regular password)
- [ ] HTTPS is enabled on both services (automatic)
- [ ] CORS is configured correctly
- [ ] No secrets in code or Git history
- [ ] .env files are in .gitignore

## Documentation

- [ ] Note all URLs (backend, frontend, database)
- [ ] Save environment variables securely (password manager)
- [ ] Document any custom configurations
- [ ] Update team on deployment status

## Optional Enhancements

- [ ] Configure custom domain on Render
- [ ] Configure custom domain on Vercel
- [ ] Set up monitoring/alerts
- [ ] Configure database backups
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Enable Render's persistent disk if needed
- [ ] Configure CDN for static assets

## Troubleshooting Reference

If you encounter issues, refer to:
- [ ] DEPLOYMENT.md - Detailed troubleshooting section
- [ ] Render service logs
- [ ] Vercel deployment logs
- [ ] Browser console errors
- [ ] Network tab in browser dev tools

## Maintenance

### Regular Checks
- [ ] Monitor Render service status
- [ ] Monitor Vercel deployment status
- [ ] Check database usage/storage
- [ ] Review application logs
- [ ] Monitor API response times

### When to Restart Services
- After changing environment variables
- After backend code updates
- If service becomes unresponsive
- When debugging connection issues

## Rollback Plan

If deployment fails:
- [ ] Previous deployment available in Render history
- [ ] Previous deployment available in Vercel history
- [ ] Can rollback via respective dashboards
- [ ] Database has backups (if configured)

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Backend URL**: _______________

**Frontend URL**: _______________

**Database**: _______________

**Notes**: 
_______________________________________________
_______________________________________________
_______________________________________________
