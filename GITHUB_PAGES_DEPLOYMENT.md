# GitHub Pages Deployment Guide

## ✅ Problem Solved!

Your Medicine Detection System now works on GitHub Pages! The application automatically detects when it's running on GitHub Pages and uses **demo mode** instead of trying to connect to a backend API (which isn't available on static hosting).

## 🔍 What Was Fixed

### The Problem
- GitHub Pages only hosts **static files** (HTML, CSS, JavaScript)
- It cannot run Python/Flask backends
- The frontend was trying to call `http://localhost:5000/api` which doesn't exist on GitHub Pages
- This caused errors when clicking "Detect Medicine"

### The Solution
The application now:
1. **Automatically detects GitHub Pages** by checking the hostname
2. **Uses demo mode** on GitHub Pages (no backend required)
3. **Falls back to demo mode** if the API is unavailable
4. **Works seamlessly** on both local development and GitHub Pages

## 🚀 How It Works Now

### On GitHub Pages
- ✅ Automatically runs in **demo mode**
- ✅ No backend required
- ✅ Works immediately after deployment
- ✅ Uses mock data for medicine detection

### On Local Development
- ✅ Tries to connect to `http://localhost:5000/api`
- ✅ If backend is running, uses the real API
- ✅ If backend is not running, automatically falls back to demo mode
- ✅ No configuration needed!

## 📝 Deploying to GitHub Pages

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fixed GitHub Pages deployment"
   git push
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select your branch (usually `main` or `master`)
   - Click **Save**
   - Your site will be available at `https://yourusername.github.io/repository-name`

3. **That's it!** The app will work in demo mode automatically.

## 🔧 Using a Real Backend (Optional)

If you want to use the full backend with OCR and AI detection, you need to deploy the backend separately:

### Option 1: Deploy Backend to Render (Free)

1. **Create a Render account** at https://render.com
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python app.py`
   - Environment: Python 3
5. **Get your backend URL** (e.g., `https://your-app.onrender.com`)

6. **Update the frontend** to use your backend:
   - Edit `script.js`
   - Change line 24 to:
     ```javascript
     let API_BASE_URL = 'https://your-app.onrender.com/api';
     ```
   - Commit and push to GitHub

### Option 2: Deploy Backend to Railway

1. **Create a Railway account** at https://railway.app
2. **Create a new project** from your GitHub repo
3. **Configure the service:**
   - Root Directory: `backend`
   - Start Command: `python app.py`
4. **Get your backend URL** and update `script.js` as above

### Option 3: Deploy Backend to Heroku

1. **Create a Heroku account** at https://heroku.com
2. **Install Heroku CLI**
3. **Create a new app:**
   ```bash
   cd backend
   heroku create your-app-name
   ```
4. **Deploy:**
   ```bash
   git push heroku main
   ```
5. **Update `script.js`** with your Heroku URL

### Option 4: Keep Backend Local (For Development)

If you're developing locally:
1. **Start the backend:**
   ```bash
   cd backend
   python app.py
   ```
2. **The frontend will automatically detect it** and use the API
3. **If backend is not running**, it will use demo mode

## 🎯 Current Configuration

The application uses smart detection:
- **GitHub Pages**: Always uses demo mode
- **Localhost**: Tries API first, falls back to demo if unavailable
- **Custom URL**: Set `API_BASE_URL` in `script.js` to use your backend

## 📋 Files Modified

- `script.js`: Added automatic environment detection and demo mode fallback

## 🐛 Troubleshooting

### App still shows errors on GitHub Pages
- Clear your browser cache
- Check browser console for errors
- Make sure you've pushed the latest code to GitHub

### Want to use a custom backend URL
- Edit `script.js` line 24
- Set `API_BASE_URL` to your backend URL
- Make sure your backend has CORS enabled (it already does in `app.py`)

### Backend not working locally
- Make sure you've installed dependencies: `pip install -r backend/requirements.txt`
- Check if port 5000 is available
- Make sure Tesseract OCR is installed (for OCR features)

## 📚 Additional Notes

- **Demo mode** uses mock data and doesn't perform real OCR or AI analysis
- **Real backend** provides OCR text extraction and more accurate detection
- The application gracefully handles API failures and always provides a working experience
- All error handling is automatic - no user configuration needed!

## 🎉 Summary

Your app now works on GitHub Pages without any backend! It automatically uses demo mode, so users can test the interface and see how it works. If you want full functionality with OCR and AI, deploy the backend separately and update the API URL in `script.js`.

---

**Need help?** Check the console logs - the app will tell you which mode it's running in!

