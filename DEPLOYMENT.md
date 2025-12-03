# Deployment Configuration

## Render Deployment (Backend)

### Steps:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     ```
     DATABASE_URL=<your_render_postgres_url>
     JWT_SECRET=<generate_random_secret>
     JWT_EXPIRES_IN=7d
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=<your_email>
     EMAIL_PASS=<your_app_password>
     STRIPE_SECRET_KEY=<your_stripe_secret>
     PORT=5000
     NODE_ENV=production
     ```

### Database Setup:

1. Create a PostgreSQL database on Render
2. Copy the Internal Database URL
3. Add it as `DATABASE_URL` environment variable
4. After deployment, run migrations via Render Shell:
   ```bash
   cd backend && node database/migrate.js
   ```

## Vercel Deployment (Frontend)

### Steps:

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Follow the prompts
5. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<your_stripe_public_key>
   ```

### Auto-deploy with GitHub:

1. Import your repository in Vercel dashboard
2. Set root directory to `frontend`
3. Configure environment variables
4. Enable automatic deployments

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
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time (e.g., "7d")
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP server port
- `EMAIL_USER` - Email account username
- `EMAIL_PASS` - Email account password or app password
- `STRIPE_SECRET_KEY` - Stripe secret key
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

### Frontend (.env.local):
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Seed data added (optional)
- [ ] Email service configured and tested
- [ ] Stripe webhooks configured
- [ ] CORS settings updated for frontend URL
- [ ] SSL certificates active
- [ ] Error monitoring setup (optional: Sentry)
- [ ] Backup strategy in place
