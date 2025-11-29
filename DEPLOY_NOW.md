# 🚀 Quick Deploy Steps

Your code is already on GitHub: https://github.com/tanekim-sudo/framework

## ⚠️ Important: You Need to Deploy BOTH Frontend AND Backend

Your app requires a backend API. You have two options:

### Option 1: Deploy Frontend Only (Limited Functionality)
The frontend will deploy but won't work fully without the backend running.

### Option 2: Full Deployment (Recommended)
Deploy both frontend and backend for a fully working app.

---

## Part 1: Deploy Frontend to Vercel

1. **Go to Vercel:** https://vercel.com
2. **Sign in** with your GitHub account (tanekim-sudo)
3. **Click "Add New Project"**
4. **Select repository:** `framework`
5. **Configure:**
   - Framework Preset: Vite (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
6. **Add Environment Variables:**
   - `GEMINI_API_KEY` = (your Gemini API key)
   - `VITE_API_URL` = `https://your-backend-url.railway.app/api` (we'll set this after deploying backend)
7. **Click "Deploy"**

✅ **Frontend will be live at:** `https://framework-xxx.vercel.app`

---

## Part 2: Deploy Backend API

Your backend is a Python/Flask app located at: `C:\Users\tanek\Downloads\smoothproto\smoothv1\`

### Option A: Deploy to Railway (Easiest - Recommended)

1. **Install Railway CLI:**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login:**
   ```powershell
   railway login
   ```

3. **Navigate to backend folder:**
   ```powershell
   cd "C:\Users\tanek\Downloads\smoothproto\smoothv1"
   ```

4. **Initialize Railway:**
   ```powershell
   railway init
   ```

5. **Deploy:**
   ```powershell
   railway up
   ```

6. **Get your backend URL** (Railway will show it, something like `https://your-app.railway.app`)

7. **Update Vercel environment variable:**
   - Go to Vercel dashboard → Your project → Settings → Environment Variables
   - Update `VITE_API_URL` = `https://your-backend-url.railway.app/api`

### Option B: Deploy to Render (Alternative)

1. Go to https://render.com
2. Create new "Web Service"
3. Connect your backend repository (or create one)
4. Set build command and start command
5. Deploy and get URL

### Option C: Keep Backend Local (Not Recommended)
If you must keep backend local, you can use ngrok or similar tunnel, but this defeats the purpose.

---

## Part 3: Connect Frontend to Backend

After backend is deployed:

1. **Get your backend URL** (e.g., `https://your-backend.railway.app`)
2. **Update Vercel environment variable:**
   - Go to Vercel → Your project → Settings → Environment Variables
   - Set `VITE_API_URL` = `https://your-backend-url.railway.app/api`
3. **Redeploy frontend** (or it will auto-redeploy on next push)

## After Deployment:

- **Every time you make changes:**
  ```powershell
  git add .
  git commit -m "Your message"
  git push
  ```
  Vercel automatically redeploys! 🎉

## 🔄 Iteration Workflow

**It's that simple:**
1. Make changes locally
2. `git push`
3. Vercel automatically builds and deploys
4. Get preview URL for testing
5. Promote to production when ready

**See `VERCEL_ITERATION_WORKFLOW.md` for detailed workflow guide.**

---

## Alternative: Deploy via CLI (if you prefer)

1. Install Vercel CLI:
   ```powershell
   npm install -g vercel
   ```

2. Login:
   ```powershell
   vercel login
   ```

3. Deploy:
   ```powershell
   vercel
   ```

4. For production:
   ```powershell
   vercel --prod
   ```

---

**That's it! No more localhost - your app will be live on the internet!** 🌐
