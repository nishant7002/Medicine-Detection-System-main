# Enable Tesseract OCR on Render

## 📋 Understanding the Issue

**Tesseract OCR has two parts:**
1. **pytesseract** (Python package) ✅ - Can be installed via pip (already in requirements.txt)
2. **Tesseract OCR binary** (system dependency) ⚠️ - Needs to be installed on the server

**Current Status:**
- ✅ `pytesseract` will install successfully
- ❌ Tesseract binary is NOT pre-installed on Render
- ✅ Your app works without OCR (uses filename-based detection as fallback)

## 🚀 Solution: Enable OCR on Render

### Option 1: Install Tesseract via Build Command (Recommended)

**In Render Dashboard:**

1. Go to your Web Service settings
2. Find **"Build Command"** field
3. Replace it with:

```bash
apt-get update && apt-get install -y tesseract-ocr && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

4. **Save** and **Redeploy**

**What this does:**
- Installs Tesseract OCR binary system-wide
- Then installs Python dependencies
- OCR will be fully functional after deployment

### Option 2: Use a Build Script

1. Create `backend/render-build.sh`:

```bash
#!/bin/bash
set -e

echo "🔧 Installing Tesseract OCR..."
apt-get update
apt-get install -y tesseract-ocr

echo "📦 Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "✅ Build complete!"
```

2. In Render Dashboard, set **Build Command** to:
```bash
chmod +x render-build.sh && ./render-build.sh
```

### Option 3: Use Docker (Advanced)

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Install system dependencies including Tesseract
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Run application
CMD ["python", "app.py"]
```

Then deploy using Docker on Render.

### Option 4: Use External OCR API (Alternative)

Instead of installing Tesseract, use a cloud OCR service:

**Services:**
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision
- Tesseract Cloud API

**Pros:**
- No system dependencies
- Better accuracy
- Handles multiple languages
- Scales automatically

**Cons:**
- Requires API keys
- May have costs
- Requires internet connection

## ✅ Verify OCR is Working

After deployment:

1. **Check health endpoint:**
   ```
   GET https://your-app.onrender.com/api/health
   ```
   Response should show: `"ocr_available": true`

2. **Test detection:**
   - Upload an image with text
   - Check if OCR text is extracted
   - Check API response for `extracted_text` field

3. **Check logs:**
   - Render dashboard → Logs
   - Look for: `"OCR_AVAILABLE: True"` or `"📝 Extracted text: ..."`

## 🔧 Troubleshooting

### OCR Still Not Working?

1. **Check if Tesseract is installed:**
   - In Render logs, you should see successful apt-get installation
   - If you see errors, Tesseract might not be installing

2. **Check pytesseract path:**
   - Render might need explicit Tesseract path
   - Update `app.py` to set Tesseract path (see below)

3. **Verify Tesseract version:**
   - Tesseract 4.x or 5.x should work
   - Check Render logs for version

### Set Explicit Tesseract Path

If Tesseract is installed but pytesseract can't find it, update `app.py`:

```python
# After importing pytesseract
import pytesseract

# Set Tesseract path (uncomment if needed)
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'
```

## 📊 Current Behavior

**Without OCR:**
- ✅ App works perfectly
- ✅ Uses filename-based detection
- ✅ Returns medicine information
- ⚠️ Less accurate (relies on filename)

**With OCR:**
- ✅ App works with full functionality
- ✅ Extracts text from images
- ✅ More accurate detection
- ✅ Can identify medicines from image text

## 🎯 Recommended Approach

**For Production:**
1. **Use Option 1** (Build Command) - Simplest and most reliable
2. Install Tesseract via apt-get in build command
3. Verify OCR is working via health endpoint
4. Monitor logs for any OCR errors

**For Development:**
- Use local installation (already set up)
- Test OCR functionality locally
- Deploy to Render with OCR enabled

## 🔗 Additional Resources

- [Tesseract OCR Documentation](https://tesseract-ocr.github.io/)
- [Render Buildpacks](https://render.com/docs/buildpacks)
- [pytesseract Documentation](https://pypi.org/project/pytesseract/)

---

## ✅ Quick Start (Copy-Paste Solution)

**In Render Dashboard → Build Command:**
```bash
apt-get update && apt-get install -y tesseract-ocr && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
```

**That's it!** OCR will be enabled after deployment. 🎉

