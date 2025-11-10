#!/bin/bash
# Installation script for Render with better error handling

set -e  # Exit on error

echo "🔧 Upgrading pip and build tools..."
pip install --upgrade pip setuptools wheel

echo "📦 Installing core dependencies first..."
pip install flask==3.0.0 flask-cors==4.0.0 werkzeug==3.0.1
pip install python-dotenv==1.0.0
pip install pillow==10.1.0

echo "📦 Installing numpy..."
pip install numpy==1.24.3

echo "📦 Installing OpenCV (headless)..."
# Try installing opencv-python-headless with retry logic
if ! pip install opencv-python-headless==4.8.1.78; then
    echo "⚠️ Failed to install specific OpenCV version, trying latest..."
    pip install opencv-python-headless
fi

echo "📦 Installing OCR (optional)..."
pip install pytesseract==0.3.10 || echo "⚠️ pytesseract installation failed (optional)"

echo "✅ Installation complete!"

