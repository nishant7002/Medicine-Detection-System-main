# Render Build Command Fixes

## 🔧 Common Build Errors & Solutions

### Error 1: "apt-get: command not found" or Permission Denied

**Problem:** Render's build environment might not allow direct `apt-get` commands.

**Solution 1: Use Render's Buildpack System**

Render uses buildpacks. Try using `apt-get` with proper permissions:

```bash
sudo apt-get update && sudo apt-get install -y tesseract-ocr && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

**Solution 2: Install Without OCR (Works Immediately)**

If OCR installation fails, deploy without it first:

```bash
pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

The app will work without OCR (uses filename-based detection).

### Error 2: "Build Command Failed" or "Exit Code 1"

**Problem:** Command syntax or execution issue.

**Solution: Use Simplified Build Command**

```bash
pip install --upgrade pip && pip install -r requirements.txt
```

Then add OCR later if needed.

### Error 3: "Tesseract OCR Installation Failed"

**Problem:** System packages can't be installed in Render's build environment.

**Solution: Deploy Without OCR First**

1. Use simple build command:
   ```bash
   pip install -r requirements.txt
   ```

2. App will work without OCR
3. Add OCR support later using alternative methods

## ✅ Recommended Build Commands (Try in Order)

### Option 1: Simple (No OCR - Works Guaranteed)

```bash
pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

**Use this if:** You want to deploy quickly and don't need OCR immediately.

### Option 2: With OCR (Try This First)

```bash
sudo apt-get update && sudo apt-get install -y tesseract-ocr && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

**Use this if:** You want OCR functionality.

### Option 3: With Error Handling

```bash
apt-get update && apt-get install -y tesseract-ocr || echo "OCR install failed, continuing..." && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

**Use this if:** Option 2 fails - continues even if OCR install fails.

### Option 4: Step-by-Step (Most Reliable)

```bash
pip install --upgrade pip setuptools wheel
```

Then in a separate step or script, try installing Tesseract.

## 🚀 Quick Fix: Deploy Without OCR First

**Step 1: Use Simple Build Command**

In Render Dashboard → Build Command:
```bash
pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

**Step 2: Verify Deployment**

1. Check if build succeeds
2. Test health endpoint: `https://your-app.onrender.com/api/health`
3. Verify app works (without OCR)

**Step 3: Add OCR Later (Optional)**

Once basic deployment works, we can add OCR using alternative methods.

## 📋 Render-Specific Solutions

### Solution A: Use Render's Native Python Buildpack

Render's Python buildpack might not support `apt-get`. In this case:

1. **Deploy without OCR first** (app works fine)
2. **Use external OCR API** as alternative (Google Vision, etc.)
3. **Or use Docker** deployment (more control)

### Solution B: Check Render Logs

1. Go to Render Dashboard → Your Service → Logs
2. Look for the exact error message
3. Share the error - we can create a specific fix

### Solution C: Use Environment-Specific Build

Create `backend/render-build-fixed.sh`:

```bash
#!/bin/bash
set -e

echo "📦 Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "🔧 Attempting to install Tesseract OCR..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y tesseract-ocr || echo "⚠️ Tesseract installation skipped"
else
    echo "⚠️ apt-get not available, skipping Tesseract (app will work without OCR)"
fi

echo "✅ Build complete!"
```

Then use build command:
```bash
chmod +x render-build-fixed.sh && bash render-build-fixed.sh
```

## 🎯 What to Do Right Now

### Immediate Action:

1. **Try Option 1 first** (Simple build - no OCR):
   ```
   pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
   ```

2. **If that works**, your app is deployed and functional (without OCR)

3. **If you get an error**, share the exact error message from Render logs

### Next Steps:

- ✅ Get app deployed and working first
- ✅ Then we can add OCR support
- ✅ App works perfectly without OCR (uses filename detection)

## 🔍 Debugging Steps

1. **Check Render Logs:**
   - Go to Render Dashboard
   - Click on your service
   - Go to "Logs" tab
   - Look for error messages

2. **Common Error Messages:**
   - `"apt-get: command not found"` → Use Solution 1 (no OCR)
   - `"Permission denied"` → Try with `sudo`
   - `"Build failed"` → Check Python version in runtime.txt
   - `"Package not found"` → Check requirements.txt syntax

3. **Share the Error:**
   - Copy the exact error message
   - Check which line failed
   - We can create a specific fix

## 📞 Need Help?

**Share these details:**
1. Exact error message from Render logs
2. Which build command you're using
3. Render service type (Web Service, etc.)

Then we can create a specific fix for your situation!

