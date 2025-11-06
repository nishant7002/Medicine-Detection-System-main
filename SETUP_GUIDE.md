# Setup Guide - Medicine Detection System

## Quick Start

### Step 1: Set Up Python Backend

1. **Install Python** (if not already installed)
   - Download from https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

2. **Navigate to backend folder**
   ```bash
   cd backend
   ```

3. **Create virtual environment**
   ```bash
   # Windows
   python -m venv venv
   
   # Mac/Linux
   python3 -m venv venv
   ```

4. **Activate virtual environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

5. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Run the backend server**
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
    * Running on http://0.0.0.0:5000
   ```

### Step 2: Run Frontend

1. **Open `index.html` in a web browser**
   - Simply double-click `index.html`
   - Or right-click → "Open with" → Your browser
   - Or use a local server:
     ```bash
     # Python
     python -m http.server 8000
     
     # Node.js (if you have it)
     npx http-server
     ```

2. **Configure the frontend** (if needed)
   - Open `script.js`
   - Line 17: Set `DEMO_MODE = false` to use the backend API
   - Line 15: Adjust `API_BASE_URL` if your backend runs on a different port

### Step 3: Test the System

1. Click "Choose Image" and select a medicine image
2. Click "Detect Medicine"
3. Wait for the results!

## Troubleshooting

### "Connection refused" or API errors

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Make sure the backend is running (Step 1, point 6)
2. Check that you're using the correct API URL in `script.js`
3. Try setting `DEMO_MODE = true` to test without the backend
4. Check browser console for detailed error messages

### "Module not found" errors

**Problem**: Python dependencies not installed correctly

**Solutions**:
1. Make sure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Try upgrading pip: `python -m pip install --upgrade pip`

### CORS errors

**Problem**: Browser blocks API requests

**Solutions**:
1. The backend already has CORS enabled
2. If issues persist, make sure you're accessing frontend via `http://localhost` not `file://`
3. Use a local server (see Step 2, point 1)

### File upload errors

**Problem**: Image upload fails

**Solutions**:
1. Check file size (max 10MB)
2. Supported formats: PNG, JPG, JPEG, GIF, WEBP
3. Try a different image

## Development Mode

### Running Both Frontend and Backend

You need **two terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
python app.py
```

**Terminal 2 - Frontend:**
```bash
# Option 1: Just open index.html in browser
# Option 2: Use a local server
python -m http.server 8000
# Then open http://localhost:8000
```

## Next Steps for Production

1. **Add Real AI/ML Model**
   - Train or use a pre-trained model
   - Update `detect_medicine()` function in `backend/app.py`
   - Consider using TensorFlow, PyTorch, or cloud APIs

2. **Improve Detection**
   - Add real OCR (pytesseract)
   - Use image classification models
   - Implement feature matching algorithms

3. **Expand Database**
   - Add more medicines
   - Store medicine images
   - Add drug interactions, side effects, etc.

4. **Add Authentication**
   - User login/signup
   - API key authentication
   - Rate limiting

5. **Deploy**
   - Backend: Heroku, AWS, DigitalOcean
   - Frontend: Netlify, Vercel, GitHub Pages
   - Database: PostgreSQL, MongoDB Atlas

## File Structure

```
Medicine-Detection-System/
├── index.html          # Frontend UI
├── script.js           # Frontend logic
├── style.css           # Frontend styling
├── README.md           # Project overview
├── SETUP_GUIDE.md      # This file
├── backend/
│   ├── app.py          # Flask API server
│   ├── requirements.txt # Python dependencies
│   ├── .gitignore      # Git ignore rules
│   └── uploads/        # Temporary uploads (auto-created)
└── (future)
    ├── models/         # ML models
    ├── database/       # Medicine database
    └── training/       # Training scripts
```

## Need Help?

- Check the main `README.md` for project overview
- Look at console errors in browser (F12 → Console)
- Check terminal output for backend errors
- Verify all dependencies are installed

## Security Notes

⚠️ **Important for production**:
- Never commit API keys or credentials
- Use HTTPS in production
- Validate and sanitize all inputs
- Set up proper authentication
- Use environment variables for configuration
- Add rate limiting to prevent abuse

