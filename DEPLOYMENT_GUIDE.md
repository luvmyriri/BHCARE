# Deployment Guide for BHCare 174 App

This guide outlines how to deploy your "BHCare 174" application to the cloud so it is accessible publicly without relying on your local computer.

## Overview
Your application is a "Full Stack" app with two main parts:
1.  **Frontend (React/Vite)**: The user interface.
2.  **Backend (Python/Flask)**: The API and database logic.

To deploy this properly, you generally host these two parts separately but connect them via URL configuration.

---

## Recommended Free/Low-Cost Hosting Strategy
We recommend using **Render.com** or **Railway.app** as they support both Python backends and Static Site frontends easily.

### Option 1: Render.com (Easiest for Beginners)

#### Step 1: Prepare the Backend
1.  **Update `requirements.txt`**: Ensure `gunicorn` is listed. It is a production server for Python web apps.
    ```bash
    pip install gunicorn
    pip freeze > requirements.txt
    ```
2.  **Create a `render.yaml` (Optional but helpful)** or configure manually on the dashboard.
3.  **Push your code to GitHub**: Render deploys directly from your GitHub repository.

#### Step 2: Deploy the Backend Web Service
1.  Sign up at [Render.com](https://render.com).
2.  Click **"New + "** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Root Directory**: `backEnd` (important!)
5.  **Build Command**: `pip install -r requirements.txt`
6.  **Start Command**: `gunicorn app:app` (Assuming your main Flask file is `app.py`)
7.  **Environment Variables**: Add any secrets (like `SECRET_KEY`, Database URL).
8.  **Deploy**: Render will give you a URL like `https://bhcare-backend.onrender.com`.

#### Step 3: Configure Frontend to use Production API
1.  In your frontend, valid API calls currently go to `localhost:5000` (via `vite.config.ts`).
2.  You need to update your API calls to point to your *new backend URL* locally or use environment variables.
    -   Create a `.env.production` file in `frontend/`:
        ```
        VITE_API_URL=https://bhcare-backend.onrender.com
        ```
    -   Update your API service files (like `src/services.tsx`) to use `import.meta.env.VITE_API_URL` instead of relative paths or hardcoded localhost.

#### Step 4: Deploy the Frontend Static Site
1.  In Render, click **"New + "** -> **"Static Site"**.
2.  Connect the same repository.
3.  **Root Directory**: `frontend`.
4.  **Build Command**: `npm install && npm run build`.
5.  **Publish Directory**: `dist` (or `build`, check your `vite.config.ts`).
6.  **Deploy**: Render will give you a URL like `https://bhcare-frontend.onrender.com`.

---

## Important Considerations

### 1. Database (SQLite vs PostgreSQL)
*   **Current Setup**: You are likely using **SQLite** (`bhcare.db`), which is a file on your disk.
*   **The Problem**: Cloud platforms (like Render/Heroku) have "ephemeral" file systems. This means every time you redeploy or restart the server (which happens daily), **your database file will be deleted/reset**.
*   **The Solution**:
    *   **Option A (Professional)**: Use a hosted PostgreSQL database. Render provides a managed Postgres database. You would need to update your `app.py` to use a `DATABASE_URL` environment variable.
    *   **Option B (Simple/Persistent Disk)**: Render offers "Disks" (paid feature) to keep files persistent.
    *   **Option C (VPS)**: Rent a Virtual Private Server (DigitalOcean, $4-5/mo) where you control the files completely. This is like having a remote computer that never turns off.

### 2. CORS Errors
*   Once deployed, your frontend (`https://bhcare-frontend...`) will try to talk to your backend (`https://bhcare-backend...`).
*   Browsers block this by default for security.
*   **Fix**: You must install `flask-cors` in your backend and configure it to allow requests from your frontend's domain.

---

## Deployment Checklist
- [ ] Backend: Install `gunicorn` and `flask-cors`.
- [ ] Backend: Switch database connection string to use an Environment Variable (for switching between SQLite locally and Postgres in production).
- [ ] Frontend: Update API calls to use the backend URL from an Environment Variable.
- [ ] GitHub: Push all latest changes to your repository.
- [ ] Sign up for Hosting Service (Render/Railway/Vercel).
