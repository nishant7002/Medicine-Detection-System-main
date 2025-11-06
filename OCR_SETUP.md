# OCR Setup Guide 📝

This guide will help you set up **real OCR (Optical Character Recognition)** for reading medicine names from images.

## What is OCR?

OCR reads text from images—useful for medicine labels, packaging, and labels.

## Installation

### Step 1: Install Tesseract OCR

**Windows:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer
3. **Important:** Note the installation path (usually `C:\Program Files\Tesseract-OCR\`)
4. During installation, **keep default path** or remember your custom path

**Mac:**
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

### Step 2: Install Python Package

Navigate to your backend folder:
```bash
cd backend
```

**If you have an active virtual environment:**
```bash
pip install pytesseract
```

**If not, activate it first:**
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Then install
pip install pytesseract
```

### Step 3: (Windows Only) Configure Tesseract Path

If Tesseract is not in your PATH, you need to tell pytesseract where to find it.

**Option A: Add to PATH (Recommended)**
1. Find where Tesseract is installed (usually `C:\Program Files\Tesseract-OCR\`)
2. Add `C:\Program Files\Tesseract-OCR\` to your Windows PATH
3. Restart terminal/IDE

**Option B: Configure in Code (Quick Fix)**

Edit `backend/app.py` and add this line **after line 19** (after the OCR_AVAILABLE check):

```python
if OCR_AVAILABLE:
    # Windows: Uncomment and set your Tesseract path if not in PATH
    # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

Uncomment the line and adjust the path if needed.

### Step 4: Test Installation

Run your backend:
```bash
python app.py
```

You should see:
```
🚀 Starting Medicine Detection API...
📍 Endpoints:
   - POST http://localhost:5000/api/detect
   - GET  http://localhost:5000/api/medicines
   - GET  http://localhost:5000/api/health

⚠️ Warning: pytesseract not installed...  ← If you see this, install failed
```

**OR** (if installed correctly):
```
🚀 Starting Medicine Detection API...
📍 Endpoints:
   - POST http://localhost:5000/api/detect
   - GET  http://localhost:5000/api/medicines
   - GET  http://localhost:5000/api/health
```

No warning = OCR is ready!

## Testing OCR

### Test 1: Health Check

Open browser and visit:
```
http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "message": "Medicine Detection API is running",
  "ocr_available": true,  ← Should be true
  "medicines_count": 5
}
```

### Test 2: Upload an Image

1. Start frontend: Open `index.html` in browser
2. Upload a medicine image (or any image with text)
3. Click "Detect Medicine"
4. Check browser console (F12) for extracted text logs

You should see in backend terminal:
```
📝 Extracted text: [text from image]...
```

## Troubleshooting

### "TesseractNotFoundError"

**Windows:**
- Tesseract not installed, OR
- Path not configured correctly

**Solution:**
1. Re-download Tesseract installer
2. Install to default path
3. Restart terminal
4. Or set path manually in `app.py` (see Step 3, Option B)

### "No module named 'pytesseract'"

**Solution:**
```bash
cd backend
pip install pytesseract
```

### "OCR not available" Warning

**Solution:**
1. Make sure you have `pytesseract` installed: `pip list | grep pytesseract`
2. Reinstall: `pip uninstall pytesseract && pip install pytesseract`
3. Restart backend

### OCR Returns Empty Text

**Common Causes:**
1. **Image quality too low** - Use clear, high-resolution images
2. **Poor lighting** - Ensure good contrast
3. **Text too small** - Use zoomed-in images
4. **Handwritten text** - OCR works best on printed text
5. **Background interference** - Use images with plain backgrounds

**Solutions:**
- Preprocessing is already built into the code
- Try different images
- Use better lighting when taking photos

### Works But Poor Accuracy

**Improvements:**
1. Use **high-quality images** (minimum 300x300 pixels)
2. Ensure **good lighting** and **contrast**
3. Avoid **blur**, **glare**, or **shadows**
4. Crop images to **focus on text** area
5. Use **printed text** (not handwritten)

## How It Works

### 1. Image Preprocessing
```
Original Image
    ↓
Grayscale Conversion
    ↓
Noise Reduction
    ↓
Adaptive Thresholding
    ↓
Prepared Image
```

### 2. OCR Process
```
Prepared Image
    ↓
Tesseract OCR Engine
    ↓
Raw Text
    ↓
Cleaned Text
```

### 3. Medicine Matching
```
Extracted Text
    ↓
Search Database
    ↓
Match Found?
    ↓
Return Results with Confidence
```

## Advanced Configuration

### Improve OCR Accuracy

Edit `backend/app.py`, find `extract_text_from_image()` function:

**Change PSM Mode (Page Segmentation Mode):**
```python
# Current: PSM 6 (single block of text)
custom_config = r'--oem 3 --psm 6'

# Try different modes:
# PSM 7 = treat image as single text line
custom_config = r'--oem 3 --psm 7'

# PSM 8 = treat as single word
custom_config = r'--oem 3 --psm 8'

# PSM 11 = sparse text
custom_config = r'--oem 3 --psm 11'
```

**Add Language Support:**
```python
# English only (default)
text = pytesseract.image_to_string(processed_img, config=custom_config)

# Multi-language (requires language packs)
text = pytesseract.image_to_string(processed_img, lang='eng+fra+spa')
```

### Add More Languages

**Windows:**
1. Download language packs from: https://tesseract-ocr.github.io/tessdoc/Data-Files.html
2. Save `.traineddata` files to `C:\Program Files\Tesseract-OCR\tessdata\`

**Example languages:**
- `eng` - English (default)
- `fra` - French
- `spa` - Spanish
- `deu` - German
- `hin` - Hindi
- `chi_sim` - Chinese Simplified

## Verification Checklist

- [ ] Tesseract OCR installed
- [ ] pytesseract package installed
- [ ] Backend starts without warnings
- [ ] `/api/health` shows `"ocr_available": true`
- [ ] Can upload images and see extracted text in logs
- [ ] Medicine detection works with text matching

## Next Steps

Once OCR is working:

1. **Add more medicines** to database
2. **Test with real medicine images**
3. **Improve matching algorithm**
4. **Add image quality checks**
5. **Consider cloud OCR** for better accuracy

## Resources

- **Tesseract Docs**: https://tesseract-ocr.github.io/
- **pytesseract Docs**: https://pypi.org/project/pytesseract/
- **PSM Modes Guide**: https://github.com/tesseract-ocr/tesseract/blob/main/doc/tesseract.1.asc

## Need Help?

Check these files for more info:
- `README.md` - Project overview
- `SETUP_GUIDE.md` - General setup
- `NEXT_STEPS.md` - Future improvements

Open an issue or check the console/logs for specific errors.

---

**🎉 Congratulations!** You now have real OCR working in your medicine detection system!

