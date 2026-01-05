# NCPA Sound Admin - Deployment Guide

## Changes Made

### 1. Fixed Dark Mode Text Visibility ✓
- Modal text is now visible in dark mode

### 2. Added Cloud Sync for Notes ✓
- Notes now sync across all your devices via Cloudflare D1 database
- Automatic fallback to localStorage if API is not configured

## Deployment Steps

### Step 1: Install Wrangler (Cloudflare CLI)

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for you to authenticate.

### Step 3: Create D1 Database

```bash
cd worker
wrangler d1 create ncpa-notes
```

**Important:** Copy the `database_id` from the output and paste it into `worker/wrangler.toml` at line 10.

Example output:
```
[[d1_databases]]
binding = "DB"
database_name = "ncpa-notes"
database_id = "abc123-def456-ghi789"  # ← Paste the ID here
```

### Step 4: Initialize Database Schema

```bash
wrangler d1 execute ncpa-notes --file=schema.sql
```

### Step 5: Deploy the Worker API

```bash
wrangler deploy
```

This will output a URL like: `https://ncpa-notes-api.your-subdomain.workers.dev`

**Copy this URL!**

### Step 6: Update Frontend Configuration

1. Open `script.js`
2. Find line 7: `const API_URL = 'YOUR_WORKER_URL_HERE';`
3. Replace with your Worker URL:
   ```javascript
   const API_URL = 'https://ncpa-notes-api.your-subdomain.workers.dev';
   ```

### Step 7: Deploy Frontend to Cloudflare Pages

Option A: Using Wrangler
```bash
cd ..
npx wrangler pages deploy . --project-name=ncpa-sound-admin
```

Option B: Using Git (Recommended for continuous deployment)
```bash
git add .
git commit -m "Add cloud sync for notes and fix dark mode

🤖 Generated with Claude Code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push

# Then connect the repo to Cloudflare Pages via the dashboard
```

### Step 8: Test on Multiple Devices

1. Open the site on Device 1
2. Create a note
3. Open the site on Device 2
4. The note should appear automatically!

## Features

✓ Notes sync across all devices
✓ Automatic fallback to localStorage
✓ Dark mode fixed
✓ Real-time updates
✓ No additional authentication needed

## Troubleshooting

### Notes not syncing?
- Check browser console for errors
- Verify API_URL is set correctly in script.js
- Test Worker API directly: `curl https://your-worker-url.workers.dev/notes`

### Worker deployment failed?
- Make sure you're logged in: `wrangler whoami`
- Check database_id is set in wrangler.toml

### CORS errors?
- The Worker is configured with `Access-Control-Allow-Origin: *`
- This is safe for a notes app, but consider restricting in production
