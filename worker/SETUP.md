# Setup Instructions for NCPA Notes API

## Prerequisites
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account logged in (`wrangler login`)

## Step 1: Create D1 Database

```bash
cd worker
wrangler d1 create ncpa-notes
```

This will output a database ID. Copy it and paste it into `wrangler.toml` at the `database_id` field.

## Step 2: Initialize Database Schema

```bash
wrangler d1 execute ncpa-notes --file=schema.sql
```

## Step 3: Test Locally (Optional)

```bash
wrangler dev
```

## Step 4: Deploy to Cloudflare

```bash
wrangler deploy
```

This will give you a Worker URL like: `https://ncpa-notes-api.<your-subdomain>.workers.dev`

## Step 5: Update Frontend

Copy the Worker URL and update the `API_URL` in the main `script.js` file.

## API Endpoints

- `GET /notes` - Get all notes
- `POST /notes` - Create a note (body: `{title, content}`)
- `PUT /notes/:id` - Update a note (body: `{title, content, completed}`)
- `DELETE /notes/:id` - Delete a note
