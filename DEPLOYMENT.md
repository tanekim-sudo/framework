# 🚀 Deploy Your App to Vercel (Live URL)

Deploy your app to Vercel so it runs on a real URL and auto-deploys on every change. No more localhost!

## Quick Deploy (Recommended - 5 minutes)

### Option 1: Deploy via GitHub (Auto-deploys on every push)

1. **Create a GitHub repository:**
   - Go to https://github.com/new
   - Create a new repository (name it something like `your-app-name`)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Sign up/login with your GitHub account (it's free)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite app
   - **Add Environment Variables** (if needed):
     - `GEMINI_API_KEY` = your Gemini API key
     - `VITE_API_URL` = your backend API URL (if you have one)
   - Click "Deploy"

4. **Done!** Your app will be live at `https://your-app-name.vercel.app`
   - Every time you push to GitHub, Vercel automatically redeploys your app
   - You'll get a new URL for each deployment

### Option 2: Deploy directly (without GitHub)

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy:**
   ```powershell
   vercel
   ```
   - Follow the prompts
   - It will ask for environment variables if needed

3. **For production:**
   ```powershell
   vercel --prod
   ```

## 🔄 Auto-Deploy on Every Change

Once connected to GitHub:
- Make changes locally
- Commit: `git add . && git commit -m "Your message"`
- Push: `git push`
- Vercel automatically builds and deploys! 🎉

## 🌐 Your Live URLs

- **Production:** `https://your-app-name.vercel.app`
- **Preview URLs:** Each commit gets its own preview URL

## 📝 Environment Variables in Vercel

1. Go to your project on Vercel dashboard
2. Settings → Environment Variables
3. Add:
   - `GEMINI_API_KEY` = (your key)
   - `VITE_API_URL` = (your backend URL, if needed)

---

## Alternative Platforms (Also Free)

### Netlify
- Similar to Vercel
- Go to https://netlify.com
- Drag and drop your `dist` folder after `npm run build`
- Or connect GitHub for auto-deploy

### Cloudflare Pages
- Go to https://pages.cloudflare.com
- Connect GitHub repository
- Free and fast CDN

### GitHub Pages
- Free hosting via GitHub
- Requires a bit more setup
- Good for static sites

---

**Recommendation:** Use **Vercel** - it's the easiest for React/Vite apps and has the best developer experience!
