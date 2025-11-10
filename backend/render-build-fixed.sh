#!/bin/bash
# Fixed build script for Render with better error handling
# This script handles cases where system packages might not be available

set -e  # Exit on error (but we'll handle OCR gracefully)

echo "📦 Step 1: Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "🔧 Step 2: Attempting to install Tesseract OCR..."
# Try to install Tesseract, but don't fail if it doesn't work
if command -v apt-get &> /dev/null; then
    echo "   apt-get is available, attempting Tesseract installation..."
    if sudo apt-get update && sudo apt-get install -y tesseract-ocr 2>/dev/null; then
        echo "   ✅ Tesseract OCR installed successfully"
    else
        echo "   ⚠️ Tesseract installation failed (app will work without OCR)"
    fi
else
    echo "   ⚠️ apt-get not available in this environment"
    echo "   ⚠️ App will work without OCR (uses filename-based detection)"
fi

echo "✅ Build complete!"
echo "📝 Note: Check health endpoint to see if OCR is available"

