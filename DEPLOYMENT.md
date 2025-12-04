# Deployment Configuration

## Render Deployment (Backend)

### Quick Start with render.yaml:

1. **Connect Repository**: 
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables** in Render Dashboard:
   ```
   DATABASE_URL=<your_render_postgres_internal_url>
   JWT_SECRET=<generate_random_secret_min_32_chars>
   JWT_EXPIRES_IN=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your_email>
   EMAIL_PASS=<your_gmail_app_password>
   STRIPE_SECRET_KEY=<your_stripe_secret_key>
   STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
   FRONTEND_URL=<your_vercel_frontend_url>
   PORT=5000
   NODE_ENV=production
   ```

### Manual Setup (Alternative):

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install --production=false`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`
   - Add all environment variables listed above

### Database Setup:

1. **Create PostgreSQL Database** on Render:
   - Click "New +" → "PostgreSQL"
   - Name: `appointment-booking-db`
   - Plan: Free (or your preferred plan)
   
2. **Get Database URL**:
   - Copy the **Internal Database URL** from your database dashboard
   - Add it as `DATABASE_URL` environment variable in your web service
   
3. **Run Migrations**:
   - After first deployment, open Render Shell for your web service
   - Run: `node database/migrate.js`
   - Optionally seed data: `node database/seed.js`

### Important Notes:
- Do NOT run migrations in the start command (causes deployment timeouts)
- Use Internal Database URL for better performance
- Health check ensures your service is properly monitored

## Vercel Deployment (Frontend)

### Quick Start with GitHub Integration (Recommended):

1. **Import Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   
2. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: Leave as `.` (vercel.json handles this)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/.next`
   - **Install Command**: `cd frontend && npm install`
   
3. **Environment Variables** (Add in Vercel Dashboard):
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<your_stripe_publishable_key>
   ```
   
4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Enable automatic deployments for push-to-deploy workflow

### Manual Deployment with Vercel CLI (Alternative):

1. **Install Vercel CLI**: 
   ```bash
   npm install -g vercel
   ```
   
2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```
   
3. **Follow Prompts**:
   - Link to existing project or create new
   - Configure as needed
   
4. **Add Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_STRIPE_PUBLIC_KEY
   ```

### Important Notes:
- The `vercel.json` file is configured for monorepo structure
- Frontend will be built in standalone mode for optimal performance
- Source maps are disabled in production for faster builds
- Always add NEXT_PUBLIC_ prefix for client-side environment variables

## Heroku Deployment (Alternative)

### Backend:

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set EMAIL_HOST=smtp.gmail.com
# ... set other variables

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run node database/migrate.js
```

### Frontend:

```bash
cd frontend
heroku create your-frontend-name
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com/api

# Deploy
git push heroku main
```

## Environment Variables Reference

### Backend (.env):
- `DATABASE_URL` - PostgreSQL connection string (use Internal URL on Render)
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters recommended)
- `JWT_EXPIRES_IN` - Token expiration time (e.g., "7d")
- `EMAIL_HOST` - SMTP server host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP server port (587 for TLS)
- `EMAIL_USER` - Email account username
- `EMAIL_PASS` - Email account password or app password (Gmail requires app password)
- `STRIPE_SECRET_KEY` - Stripe secret key (starts with sk_)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (starts with whsec_)
- `FRONTEND_URL` - Frontend URL for CORS (e.g., https://your-app.vercel.app)
- `PORT` - Server port (default: 5000, Render auto-assigns)
- `NODE_ENV` - Environment (development/production)

### Frontend (.env.local):
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., https://your-backend.onrender.com/api)
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key (starts with pk_)

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Seed data added (optional)
- [ ] Email service configured and tested
- [ ] Stripe webhooks configured (point to: https://your-backend.onrender.com/api/payments/webhook)
- [ ] CORS settings updated for frontend URL
- [ ] SSL certificates active (automatic on Render and Vercel)
- [ ] Health check responding: https://your-backend.onrender.com/api/health
- [ ] Frontend can communicate with backend
- [ ] Error monitoring setup (optional: Sentry)
- [ ] Backup strategy in place

## Troubleshooting Common Issues

### Render Backend Issues:

1. **Build Fails**:
   - Check that `render.yaml` has correct `rootDir: backend`
   - Ensure all dependencies are in `package.json`
   - Review build logs in Render dashboard

2. **Database Connection Fails**:
   - Use **Internal Database URL**, not External
   - Verify DATABASE_URL environment variable is set
   - Check database is in same region as web service
   - Test with: `curl https://your-backend.onrender.com/api/health`

3. **Service Won't Start**:
   - Check you're NOT running migrations in start command
   - Verify PORT environment variable (Render auto-assigns)
   - Review application logs in Render dashboard
   - Ensure all required environment variables are set

4. **Migrations Not Running**:
   - Run manually via Render Shell: `node database/migrate.js`
   - Do NOT include in start command (causes timeouts)
   - Check DATABASE_URL is accessible

### Vercel Frontend Issues:

1. **Build Fails**:
   - Check `vercel.json` configuration is correct
   - Ensure all dependencies in `frontend/package.json`
   - Review build logs in Vercel dashboard
   - Verify Next.js version compatibility

2. **Environment Variables Not Working**:
   - Must have `NEXT_PUBLIC_` prefix for client-side variables
   - Redeploy after adding/changing environment variables
   - Check they're set for Production environment

3. **API Connection Fails**:
   - Verify `NEXT_PUBLIC_API_URL` includes `/api` suffix
   - Check backend allows frontend URL in CORS
   - Test backend health: https://your-backend.onrender.com/api/health
   - Check browser console for CORS errors

4. **Build Works Locally But Fails on Vercel**:
   - Clear Vercel build cache
   - Check Node.js version compatibility
   - Ensure all dependencies are in `package.json`, not globally installed

### General Issues:

1. **CORS Errors**:
   - Set `FRONTEND_URL` environment variable in backend
   - Restart backend service after changing environment variables
   - Ensure frontend URL doesn't have trailing slash

2. **SSL/HTTPS Issues**:
   - Both Render and Vercel provide automatic HTTPS
   - Update API URL to use `https://` not `http://`
   - Check mixed content warnings in browser console

3. **Performance Issues**:
   - Enable Render's persistent disk if needed
   - Consider upgrading from free tier
   - Optimize database queries
   - Enable Next.js caching strategies

### Getting Help:

- Check service logs in Render/Vercel dashboards
- Test health endpoint: `/api/health`
- Review error messages in browser console
- Check GitHub repository issues
- Render Status: https://status.render.com/
- Vercel Status: https://www.vercel-status.com/
