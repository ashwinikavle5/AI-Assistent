# SpeakWise AI — Production Deployment Guide

This guide provides step-by-step instructions specifically written for hosting the **SpeakWise AI** full-stack application online.

---

## 1. Detected Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Runtime** | Node.js (v18+) | Full-stack JavaScript engine |
| **Backend** | Express 4 | Modular REST API, static asset caching, SPA fallback |
| **Frontend** | React 19 + Vite | Tailwind CSS 4, Lucide Icons, Canvas Confetti |
| **Database** | SQLite3 (`sqlite3`) | Persistent file database (`server/data/speakwise.db` or custom `DATABASE_PATH`) |
| **AI Engine** | Built-in Intent Engine & Roman Marathi NLP | Offline-first with optional Google Gemini / OpenAI integration |

---

## 2. Recommended Hosting Platform: Render (or Railway)

### Why Render / Railway is Ideal for SpeakWise AI:
1. **Full-Stack Node.js Support**: Deploys both the Express backend and the compiled React SPA in a single unified service.
2. **Persistent Disk Support**: Crucial for the SQLite database (`speakwise.db`), ensuring user accounts, conversation history, and daily streaks persist across deployments and server restarts.
3. **Automatic SSL/HTTPS**: Free, managed SSL certificates for your domain.
4. **Zero Cross-Origin / CORS Headaches**: The Express server serves both the `/api/*` endpoints and the frontend `index.html` on the same domain, eliminating localhost and CORS failures.
5. **Dynamic Port Handling**: Express automatically binds to `process.env.PORT`.

---

## 3. Required Account Setup

1. Create a free account at [Render.com](https://render.com) (or [Railway.app](https://railway.app)).
2. Connect your GitHub or GitLab account.
3. Push your SpeakWise AI project repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: production-ready SpeakWise AI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/speakwise-ai.git
   git push -u origin main
   ```

---

## 4. Required Environment Variables

Configure these environment variables in your hosting dashboard under **Environment**:

| Variable Name | Required | Default / Recommended Value | Description |
|---|---|---|---|
| `NODE_ENV` | **Yes** | `production` | Enables production optimizations |
| `PORT` | **Auto** | `5000` (Auto-assigned) | Render/Railway assigns this automatically |
| `JWT_SECRET` | **Yes** | Random 32+ character string | Secret key for signing and verifying user session tokens |
| `DATABASE_PATH` | Recommended | `/var/data/speakwise.db` | File path on persistent disk for SQLite database |
| `AI_API_KEY` | Optional | *(Leave empty or provide Gemini API Key)* | Google Gemini API key if using external generative AI |
| `CORS_ORIGIN` | Optional | `*` | Allowed CORS origins (defaults to `*`) |

> [!WARNING]
> Never commit real values of `JWT_SECRET` or `AI_API_KEY` to public repositories. Use `.env.example` as a template.

---

## 5. Deployment Options

### Option A: Deploy via Render Web Service (Recommended)

1. Go to the **Render Dashboard** $\rightarrow$ Click **New +** $\rightarrow$ Select **Web Service**.
2. Select your repository: `speakwise-ai`.
3. Fill in the service details:
   - **Name**: `speakwise-ai`
   - **Region**: Closest to your users (e.g., *Oregon (US West)*, *Frankfurt (EU)*, or *Singapore (Asia)*)
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty to use root)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
4. **Add Persistent Disk** (to preserve user accounts, streaks, and practice data):
   - In the service settings, scroll to **Disks** $\rightarrow$ Click **Add Disk**.
   - **Name**: `speakwise-storage`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB` (sufficient for thousands of users)
5. **Set Environment Variables**:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(Generate a secure random string)*
   - `DATABASE_PATH` = `/var/data/speakwise.db`
   - `AI_API_KEY` = *(Optional)*
6. Click **Create Web Service**.

---

### Option B: Deploy via Render Blueprint (`render.yaml`)

This repository includes a ready-to-use [`render.yaml`](render.yaml) file:
1. In Render Dashboard, click **New +** $\rightarrow$ Select **Blueprint**.
2. Connect your repository. Render will automatically parse `render.yaml` and configure the Web Service, disk, build, and start commands.
3. Click **Apply**.

---

### Option C: Deploy via Railway

1. Go to [Railway.app](https://railway.app) $\rightarrow$ Click **New Project** $\rightarrow$ Select **Deploy from GitHub repo**.
2. Select your `speakwise-ai` repository.
3. Go to the service **Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Go to the **Variables** tab and add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(Secure random 32+ char key)*
5. Add a Volume:
   - Go to **Volumes** $\rightarrow$ Click **Add Volume** $\rightarrow$ Mount path: `/var/data`.
   - Set environment variable `DATABASE_PATH` to `/var/data/speakwise.db`.
6. Railway will automatically deploy and assign an active public domain (`https://speakwise-ai.up.railway.app`).

---

### Option D: Deploy via Docker (Any Cloud Provider)

This repository includes a production multi-stage [`Dockerfile`](Dockerfile).
To build and run anywhere (AWS ECS, Google Cloud Run, DigitalOcean App Platform, Fly.io):
```bash
# Build production Docker container
docker build -t speakwise-ai .

# Run container with persistent data volume
docker run -d -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your_super_secret_jwt_key_here \
  -v speakwise-data:/app/server/data \
  --name speakwise-container \
  speakwise-ai
```

---

## 6. How to Check Deployment Logs

- **On Render**:
  - In the Render Dashboard, click on your service `speakwise-ai`.
  - Click **Logs** in the left sidebar to view real-time build and server output.
  - Look for:
    ```
    Connected to SpeakWise SQLite database at /var/data/speakwise.db
    Database tables initialized successfully.
    🚀 SpeakWise AI Backend Server running on port 10000
    ```
- **On Railway**:
  - Click your service box $\rightarrow$ Click the **Deployments** tab $\rightarrow$ Click **View Logs**.

---

## 7. How to Test the Live Website

Once your deployment completes and gives you a URL (e.g., `https://speakwise-ai.onrender.com`):

1. **Verify Health Endpoint**:
   Visit `https://<your-deployed-domain>/api/health`
   Expected response:
   ```json
   {
     "status": "ok",
     "product": "SpeakWise AI",
     "timestamp": "..."
   }
   ```
2. **Verify Static Assets**:
   - Visit `https://<your-deployed-domain>/speakwise-robot.png` (Cute robot avatar loads).
   - Visit `https://<your-deployed-domain>/favicon.png` (Favicon loads).
3. **Test User Authentication**:
   - Open `https://<your-deployed-domain>/register` and create an account.
   - Confirm automatic redirect to `/dashboard`.
   - Log out and test signing back in via `/login`.
4. **Test Route Protection**:
   - Open an Incognito/Private window.
   - Navigate to `https://<your-deployed-domain>/ai-assistant` or `/dashboard`.
   - Confirm automatic redirect to `/login`.
5. **Test AI Assistant Conversations**:
   Test the 10 required prompt scenarios in the AI Assistant chat.
6. **Test Theme Switcher**:
   - Test switching between all 6 themes (Light, Dark, Purple Dream, Ocean, Forest, Sunset) and refresh the page to verify persistence.

---

## 8. Common Deployment Errors and Solutions

### 1. Error: `Cannot find module 'express'` or `Cannot find module 'vite'`
* **Cause**: Dependencies in subdirectories were not installed during build.
* **Fix**: Ensure root `package.json` contains `"postinstall": "npm run install:server && npm run install:client"`. On Render, set the Build Command to: `npm install && npm run build`.

### 2. Error: `SQLITE_CANTOPEN: unable to open database file`
* **Cause**: The directory for SQLite does not exist or lacks write permissions.
* **Fix**: In [`server/db/database.js`](server/db/database.js), the code automatically creates the parent directory using `fs.mkdirSync(path.dirname(dbPath), { recursive: true })`. Ensure the `DATABASE_PATH` directory is writable.

### 3. Error: Data resets after server restarts / redeployments
* **Cause**: Hosting on ephemeral storage without a Persistent Disk.
* **Fix**: Add a Persistent Disk on Render (`/var/data`, 1GB) and set `DATABASE_PATH=/var/data/speakwise.db`.

### 4. Error: Frontend API calls fail with 404 or CORS errors
* **Cause**: Frontend trying to reach `http://localhost:5000` instead of relative paths.
* **Fix**: All frontend requests use relative paths (`/api/*`). The Express server serves both the API and the SPA from the same domain, eliminating CORS and port mismatches.
