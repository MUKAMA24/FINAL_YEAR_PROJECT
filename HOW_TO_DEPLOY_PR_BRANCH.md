# How to Deploy a PR Branch on Render

If you need to test deployment fixes before merging to main, follow these steps to deploy from a PR branch.

## Why Deploy from a PR Branch?

When a PR contains deployment fixes (like this one), you may want to test them before merging to main. This guide shows you how to configure Render to deploy from a specific branch.

## Steps to Change Deployment Branch

### 1. Go to Your Render Service

1. Visit https://dashboard.render.com/
2. Click on your web service (e.g., "appointment-booking-backend")

### 2. Access Settings

1. Click on **"Settings"** in the left sidebar (or top navigation)
2. Scroll down to the **"Build & Deploy"** section

### 3. Change the Branch

1. Find the **"Branch"** field
2. Current value is probably: `main`
3. Change it to: `copilot/fix-deployment-issues`
4. Click **"Save Changes"**

### 4. Trigger Deployment

Render will automatically start a new deployment with the selected branch.

You can also manually trigger it:
1. Go to the service dashboard
2. Click **"Manual Deploy"** button
3. Select **"Deploy latest commit"**

### 5. Monitor Deployment

1. Watch the deployment logs in real-time
2. Look for successful build message: "Build successful 🎉"
3. Wait for deployment to complete

### 6. Run Migrations

After successful deployment:
1. Click the **"Shell"** button in your service dashboard
2. Run: `node database/migrate.js`
3. Verify migrations completed successfully

## Important Notes

### When Using PR Branches:

✅ **Good for testing**: Test deployment fixes before merging
✅ **Temporary**: Switch back to `main` after merging the PR
✅ **Latest code**: Always deploys the latest commit from that branch

### After Merging PR:

1. Merge the PR to `main` on GitHub
2. In Render Settings, change branch back to `main`
3. Save changes to deploy from main again

## Troubleshooting

### "Branch not found" Error

If Render can't find the branch:
1. Make sure you pushed the branch to GitHub
2. Check the exact branch name (case-sensitive)
3. Verify Render has access to the repository

### Still Deploying Old Code

If Render keeps deploying old code:
1. Check you saved the branch change in Settings
2. Trigger a manual deployment
3. Clear any build cache (in service settings)

### Deployment Still Failing

If deployment fails even from the PR branch:
1. Check deployment logs for specific errors
2. Verify all environment variables are set
3. See [RENDER_TROUBLESHOOTING.md](./RENDER_TROUBLESHOOTING.md) for common issues

## Alternative: Merge First, Then Deploy

If you prefer not to deploy from a PR branch:

1. **Merge the PR on GitHub**:
   - Review the PR changes
   - Click "Merge pull request"
   - Confirm the merge

2. **Render Auto-Deploys** (if auto-deploy is enabled):
   - Render will automatically deploy the updated main branch
   - Watch the deployment in your Render dashboard

3. **Or Manual Deploy**:
   - Go to Render Dashboard → Your Service
   - Click "Manual Deploy" → "Deploy latest commit"

## Comparison: PR Branch vs. Main Branch

| Aspect | PR Branch | Main Branch |
|--------|-----------|-------------|
| **Testing** | Test fixes before merge | Production code only |
| **Risk** | Lower (can revert easily) | Higher (affects everyone) |
| **Use Case** | Testing deployment fixes | Normal deployments |
| **Setup** | Change branch in settings | Default configuration |
| **Recommendation** | Good for this scenario | Normal workflow |

## Current Situation

For this PR (`copilot/fix-deployment-issues`):

**Problem**: Main branch has old code with migration issues
**Solution**: Deploy from PR branch to test fixes
**After Success**: Merge PR, switch back to main

## Quick Reference

```bash
# Render Settings Path:
Dashboard → Service → Settings → Build & Deploy → Branch

# Change from:
main

# Change to:
copilot/fix-deployment-issues

# After deployment:
node database/migrate.js
```

## Related Documentation

- [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) - General deployment guide
- [RENDER_TROUBLESHOOTING.md](./RENDER_TROUBLESHOOTING.md) - Render-specific issues
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
