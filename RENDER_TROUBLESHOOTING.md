# Render Deployment Troubleshooting

This guide helps you troubleshoot common Render deployment issues.

## Error: Database Connection Refused (ECONNREFUSED 127.0.0.1:5432)

### Symptoms:
```
Database connection error: 
Migration error: AggregateError [ECONNREFUSED]: 
  Error: connect ECONNREFUSED 127.0.0.1:5432
```

### Root Cause:
The application is trying to connect to localhost (127.0.0.1) instead of your Render PostgreSQL database. This happens when the `DATABASE_URL` environment variable is not set or is incorrectly configured.

### Solution:

#### Step 1: Check DATABASE_URL Environment Variable

1. Go to your Render Dashboard: https://dashboard.render.com/
2. Open your web service
3. Click on the **"Environment"** tab
4. Look for `DATABASE_URL` in the list

#### Step 2: Set DATABASE_URL (if missing)

1. In your Render Dashboard, open your **PostgreSQL database** (not the web service)
2. Copy the **Internal Database URL** (should start with `postgresql://`)
   - **Important**: Use the **Internal** URL, not External
   - Internal URL format: `postgresql://user:password@dpg-xxxxx-internal/database`
3. Go back to your **web service** → **Environment** tab
4. Click **"Add Environment Variable"**
5. Key: `DATABASE_URL`
6. Value: Paste the Internal Database URL
7. Click **"Save Changes"**

#### Step 3: Verify Deployment Branch

Check which branch/commit you're deploying from:
- The fixes for deployment issues are in the `copilot/fix-deployment-issues` branch
- If you're deploying from `main`, make sure the PR has been merged first
- Or configure Render to deploy from the `copilot/fix-deployment-issues` branch

#### Step 4: Manual Deployment (if needed)

If you need to manually redeploy:
1. Go to your service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

#### Step 5: Run Migrations

After successful deployment:
1. Click **"Shell"** button in your service dashboard
2. Run: `node database/migrate.js`
3. Optionally seed data: `node database/seed.js`

---

## Error: Deployment Timeout During Migrations

### Symptoms:
```
==&gt; Running 'npm run migrate && npm start'
==&gt; Exited with status 1
```

### Root Cause:
Running migrations in the start command causes deployment timeouts on Render's free tier.

### Solution:

This issue is fixed in the PR. The updated `render.yaml` has:
```yaml
startCommand: node server.js
# Migrations removed from start command
```

**To apply this fix:**
1. Merge the PR to your main branch, OR
2. Deploy from the `copilot/fix-deployment-issues` branch
3. Run migrations manually in Render Shell after deployment

---

## Error: Build Fails with Missing Dependencies

### Symptoms:
```
Module not found: Cannot find module 'xxx'
```

### Solution:

Check the build command in `render.yaml`:
```yaml
buildCommand: npm install --production=false
```

The `--production=false` flag ensures dev dependencies are installed during build but not kept in the final image.

---

## Checking Your Configuration

### Verify render.yaml:

Your `render.yaml` should look like this:

```yaml
services:
  - type: web
    name: appointment-booking-backend
    env: node
    plan: free
    region: oregon
    rootDir: backend
    buildCommand: npm install --production=false
    startCommand: node server.js  # NO migrations here!
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
    healthCheckPath: /api/health
    autoDeploy: false
```

### Required Environment Variables:

Make sure ALL of these are set in Render:
- ✅ `DATABASE_URL` - Internal PostgreSQL URL from Render database
- ✅ `JWT_SECRET` - Random 32+ character string
- ✅ `JWT_EXPIRES_IN` - e.g., "7d"
- ✅ `EMAIL_HOST` - e.g., "smtp.gmail.com"
- ✅ `EMAIL_PORT` - e.g., "587"
- ✅ `EMAIL_USER` - Your Gmail address
- ✅ `EMAIL_PASS` - Gmail App Password
- ✅ `STRIPE_SECRET_KEY` - From Stripe Dashboard
- ✅ `STRIPE_WEBHOOK_SECRET` - From Stripe Webhooks
- ✅ `FRONTEND_URL` - Your Vercel frontend URL
- ✅ `NODE_ENV` - "production"
- ✅ `PORT` - "5000" (or leave empty for auto-assign)

---

## Testing Your Deployment

### 1. Check Health Endpoint:
```bash
curl https://your-service.onrender.com/api/health
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

### 2. Check Logs:

1. Go to your service in Render Dashboard
2. Click on **"Logs"** tab
3. Look for:
   - ✅ "Server is running on port XXXX"
   - ✅ "Database connection successful"
   - ❌ Any error messages

### 3. Common Log Messages:

**Success:**
```
Database connection successful
Server is running on port 5000
Environment: production
```

**Failure:**
```
Database connection error: connect ECONNREFUSED
```
→ DATABASE_URL not set correctly

---

## Quick Checklist

Before contacting support, verify:

- [ ] Using the correct branch (with fixes)
- [ ] DATABASE_URL is set to **Internal** database URL
- [ ] All required environment variables are set
- [ ] Database is running (check database dashboard)
- [ ] Database and web service are in the same region
- [ ] Migrations were run manually after first deployment
- [ ] Health check endpoint returns 200 OK

---

## Getting More Help

1. **Check Render Status**: https://status.render.com/
2. **Review Logs**: Service Dashboard → Logs tab
3. **Render Docs**: https://render.com/docs
4. **This Repo's Docs**: 
   - [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)
   - [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Need to Rollback?

If you need to revert to a previous deployment:

1. Go to your service dashboard
2. Click on **"Events"** tab
3. Find a successful deployment
4. Click **"Rollback to this deploy"**
