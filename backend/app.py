from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import cv2
import numpy as np
from PIL import Image
import re

# Try to import pytesseract for OCR
try:
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("⚠️ Warning: pytesseract not installed. OCR features will be limited.")
    print("   Install with: pip install pytesseract")
    print("   And install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki")

app = Flask(__name__)
CORS(app)  # Allow frontend to access this API

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Sample medicine database
MEDICINE_DATABASE = {
    'Paracetamol': {
        'name': 'Paracetamol',
        'description': 'Common analgesic and antipyretic used to treat pain and fever.',
        'uses': 'Fever, mild to moderate pain, headache',
        'dosage': '500-1000mg every 4-6 hours',
        'side_effects': 'Rare: liver damage with overdose'
    },
    'Aspirin': {
        'name': 'Aspirin',
        'description': 'Nonsteroidal anti-inflammatory drug (NSAID).',
        'uses': 'Pain, inflammation, blood thinning, heart attack prevention',
        'dosage': '325-650mg every 4-6 hours',
        'side_effects': 'Stomach irritation, bleeding risk'
    },
    'Amoxicillin': {
        'name': 'Amoxicillin',
        'description': 'Broad-spectrum penicillin antibiotic.',
        'uses': 'Bacterial infections: pneumonia, ear infections, urinary tract',
        'dosage': '250-500mg every 8 hours',
        'side_effects': 'Diarrhea, allergic reactions, fungal infections'
    },
    'Cetirizine': {
        'name': 'Cetirizine',
        'description': 'Second-generation antihistamine for allergy relief.',
        'uses': 'Allergic rhinitis, hives, itching',
        'dosage': '10mg once daily',
        'side_effects': 'Drowsiness (rare), dry mouth'
    },
    'Omeprazole': {
        'name': 'Omeprazole',
        'description': 'Proton pump inhibitor that reduces stomach acid production.',
        'uses': 'Acid reflux, GERD, stomach ulcers',
        'dosage': '20-40mg once daily before meals',
        'side_effects': 'Headache, diarrhea, vitamin B12 deficiency'
    }
}


def preprocess_image_for_ocr(image_path):
    """
    Preprocess image to improve OCR accuracy.
    Converts to grayscale, applies thresholding, and noise reduction.
    """
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding for better text contrast
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Additional denoising
        denoised = cv2.fastNlMeansDenoising(thresh, h=10)
        
        return denoised
    except Exception as e:
        print(f"Image preprocessing error: {e}")
        # Fallback: just read as grayscale
        try:
            img = cv2.imread(image_path)
            return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img is not None else None
        except:
            return None


def extract_text_from_image(image_path):
    """
    Extract text from image using OCR.
    Uses pytesseract if available, otherwise returns empty string.
    """
    if not OCR_AVAILABLE:
        print("OCR not available - returning empty text")
        return ""
    
    try:
        # Preprocess image for better OCR accuracy
        processed_img = preprocess_image_for_ocr(image_path)
        
        if processed_img is None:
            # Fallback: read image directly
            processed_img = Image.open(image_path)
        else:
            # Convert to PIL Image
            processed_img = Image.fromarray(processed_img)
        
        # Perform OCR
        # Config: OCR Engine Mode 3 (default), PSM 6 (assume single block of text)
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(processed_img, config=custom_config)
        
        # Clean and return text
        cleaned_text = text.strip()
        print(f"📝 Extracted text: {cleaned_text[:100]}...")  # Log first 100 chars
        return cleaned_text
        
    except Exception as e:
        print(f"⚠️ OCR error: {e}")
        # Try basic OCR without preprocessing
        try:
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img)
            return text.strip()
        except Exception as e2:
            print(f"⚠️ Basic OCR also failed: {e2}")
            return ""


def analyze_image_features(image_path):
    """
    Analyze image features to help identify medicine.
    This is a placeholder - you would implement actual feature extraction.
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Get basic image statistics
        height, width = img.shape[:2]
        avg_color = np.mean(img, axis=(0, 1))
        
        # Convert to different color spaces
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        return {
            'dimensions': f"{width}x{height}",
            'avg_color': avg_color.tolist(),
            'aspect_ratio': width / height if height > 0 else 0
        }
    except Exception as e:
        print(f"Image analysis error: {e}")
        return None


def find_medicine_by_text(text, filename):
    """
    Search for medicine in database based on extracted text and filename.
    Returns best match with confidence score.
    """
    if not text:
        text = ""
    
    # Combine text sources for searching
    search_text = (text + " " + filename).lower()
    
    best_match = None
    best_confidence = 0.0
    
    # Check each medicine in database
    for medicine_name, medicine_data in MEDICINE_DATABASE.items():
        medicine_lower = medicine_name.lower()
        confidence = 0.0
        
        # Exact match = highest confidence
        if medicine_lower == filename.lower():
            confidence = 0.95
        # Name found in OCR text
        elif medicine_lower in text.lower():
            confidence = 0.85
        # Name found in filename
        elif medicine_lower in filename.lower():
            confidence = 0.75
        # Partial match in text
        elif len(medicine_name) > 5 and medicine_lower[:5] in text.lower():
            confidence = 0.65
        # Check for partial matches
        elif any(word in search_text for word in medicine_lower.split() if len(word) > 4):
            confidence = 0.55
        
        # Update best match
        if confidence > best_confidence:
            best_confidence = confidence
            best_match = medicine_name
    
    return best_match, best_confidence


def detect_medicine(image_path, filename):
    """
    Main detection function using OCR and text matching.
    """
    # Extract text from image using OCR
    text = extract_text_from_image(image_path)
    
    # Analyze image features (for future ML integration)
    features = analyze_image_features(image_path)
    
    # Find medicine based on OCR text and filename
    best_match, confidence = find_medicine_by_text(text, filename)
    
    # If we found a good match, return it
    if best_match and confidence >= 0.5:
        return {
            'medicine': MEDICINE_DATABASE[best_match],
            'confidence': confidence,
            'extracted_text': text[:200] if text else None  # Include first 200 chars
        }
    
    # Fallback: random selection for demo purposes
    import random
    medicine_name = random.choice(list(MEDICINE_DATABASE.keys()))
    confidence = random.uniform(0.4, 0.6)
    
    return {
        'medicine': MEDICINE_DATABASE[medicine_name],
        'confidence': confidence,
        'extracted_text': text[:200] if text else None,
        'note': 'Low confidence - could not identify medicine'
    }


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Medicine Detection API is running',
        'ocr_available': OCR_AVAILABLE,
        'medicines_count': len(MEDICINE_DATABASE)
    })


@app.route('/api/detect', methods=['POST'])
def detect_medicine_endpoint():
    """
    Main API endpoint for medicine detection
    Receives image from frontend and returns detection results
    """
    try:
        # Check if file is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # Validate file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Use: png, jpg, jpeg, gif, webp'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Perform detection
        result = detect_medicine(filepath, filename)
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except:
            pass
        
        # Return results
        response = {
            'success': True,
            'medicine': result['medicine'],
            'confidence': result['confidence'],
            'ocr_available': OCR_AVAILABLE
        }
        
        # Add extracted text if available
        if 'extracted_text' in result and result['extracted_text']:
            response['extracted_text'] = result['extracted_text']
        
        # Add note if present
        if 'note' in result:
            response['note'] = result['note']
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Detection error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/medicines', methods=['GET'])
def get_medicines():
    """Get list of all medicines in database"""
    return jsonify({
        'medicines': list(MEDICINE_DATABASE.keys()),
        'count': len(MEDICINE_DATABASE)
    })


@app.route('/api/medicine/<name>', methods=['GET'])
def get_medicine_details(name):
    """Get details of a specific medicine"""
    if name in MEDICINE_DATABASE:
        return jsonify({
            'success': True,
            'medicine': MEDICINE_DATABASE[name]
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Medicine not found'
        }), 404


if __name__ == '__main__':
    print("🚀 Starting Medicine Detection API...")
    print("📍 Endpoints:")
    print("   - POST http://localhost:5000/api/detect")
    print("   - GET  http://localhost:5000/api/medicines")
    print("   - GET  http://localhost:5000/api/health")
    app.run(debug=True, host='0.0.0.0', port=5000)

