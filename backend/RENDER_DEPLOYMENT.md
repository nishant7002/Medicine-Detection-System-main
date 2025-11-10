# Render Deployment Guide

## 🚀 Quick Deploy to Render

### Step 1: Prepare Your Repository
Make sure your `backend` folder contains:
- `app.py` (Flask application)
- `requirements.txt` (Python dependencies)
- `runtime.txt` (Python version - optional)

### Step 2: Create Render Web Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `medicine-detection-api` (or your choice)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Root Directory**: `backend` (important!)

### Step 3: Environment Variables (Optional)

Add these if needed:
- `PORT`: Render automatically sets this (don't override)
- `FLASK_ENV`: `production`
- Any other environment variables your app needs

### Step 4: Deploy!

Click **"Create Web Service"** and wait for deployment.

## 🔧 Troubleshooting

### Build Error: "Getting requirements to build wheel: finished with status 'error'"

This usually means:
1. **Package version conflict** - Fixed by updating requirements.txt
2. **Missing system dependencies** - OpenCV might need system libraries
3. **Python version mismatch** - Check runtime.txt
4. **OpenCV build failure** - Most common issue

**Solutions:**

**Option 1: Use the updated requirements.txt** (already fixed)
- ✅ Removed unused packages (scikit-learn, scikit-image, sqlalchemy)
- ✅ Using `opencv-python-headless` (server-friendly)
- ✅ Compatible package versions

**Option 2: If OpenCV still fails, modify build command:**
In Render dashboard, change Build Command to:
```bash
pip install --upgrade pip setuptools wheel && pip install flask==3.0.0 flask-cors==4.0.0 werkzeug==3.0.1 python-dotenv==1.0.0 pillow==10.1.0 numpy==1.24.3 && pip install opencv-python-headless --no-cache-dir && pip install pytesseract==0.3.10 || true
```

**Option 3: Use requirements-minimal.txt**
1. Rename `requirements-minimal.txt` to `requirements.txt`
2. Use version ranges instead of exact versions
3. This allows pip to resolve compatible versions automatically

**Option 4: Make OpenCV optional (if absolutely necessary)**
- Modify `app.py` to handle missing OpenCV gracefully
- Use PIL/Pillow only for basic image processing
- This reduces functionality but ensures deployment succeeds

### OCR Not Working

Tesseract OCR requires the Tesseract binary, which is NOT pre-installed on Render by default.

**✅ Solution: Enable OCR on Render**

**Option 1: Install Tesseract via Build Command (Recommended)**

In Render Dashboard → Build Command, use:
```bash
apt-get update && apt-get install -y tesseract-ocr && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

This installs Tesseract OCR binary during build, enabling full OCR functionality.

**Option 2: Use Build Script**

1. Use the provided `render-build.sh` script
2. In Render Dashboard, set Build Command to:
   ```bash
   chmod +x render-build.sh && ./render-build.sh
   ```

**Option 3: Work Without OCR**

The app is designed to work without OCR - it will use filename-based detection as fallback. This is fine for demo purposes, but OCR provides better accuracy.

**📖 See `ENABLE_OCR_RENDER.md` for detailed instructions on enabling OCR.**

### OpenCV Build Issues

If OpenCV still fails to build:
1. Check Render logs for specific error
2. Try updating to latest `opencv-python-headless` version
3. Consider using PIL/Pillow only for basic image processing

### Port Configuration

Render automatically sets the `PORT` environment variable. Make sure your Flask app uses it:

```python
import os
port = int(os.environ.get('PORT', 5000))
app.run(host='0.0.0.0', port=port)
```

## 📝 Updated Requirements.txt

The requirements.txt has been optimized for Render:
- ✅ Removed unused packages
- ✅ Using `opencv-python-headless` (server-friendly)
- ✅ Compatible package versions
- ✅ Minimal dependencies

## 🔗 After Deployment

1. **Get your backend URL**: `https://your-app.onrender.com`
2. **Update frontend**: Edit `script.js` and set:
   ```javascript
   let API_BASE_URL = 'https://your-app.onrender.com/api';
   ```
3. **Test the API**: Visit `https://your-app.onrender.com/api/health`

## ⚠️ Important Notes

- **Free tier limitations**: Render free tier services sleep after 15 minutes of inactivity
- **Cold starts**: First request after sleep may take 30-60 seconds
- **Build time**: First deployment may take 5-10 minutes
- **OCR**: Tesseract OCR may not work on Render free tier (app will work without it)

## 🎯 Current Configuration

- **Python**: 3.11 (specified in runtime.txt)
- **Flask**: 3.0.0
- **OpenCV**: Headless version (no GUI dependencies)
- **OCR**: Optional (gracefully disabled if not available)

---

**Need help?** Check Render logs in the dashboard for specific error messages!

