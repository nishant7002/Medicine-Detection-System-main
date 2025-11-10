#!/bin/bash
# Build script for Render deployment
# This script installs system dependencies and Python packages

set -e  # Exit on error

echo "🔧 Installing system dependencies..."

# Install Tesseract OCR if available (optional)
# Uncomment if you want OCR functionality on Render
# sudo apt-get update && sudo apt-get install -y tesseract-ocr

echo "📦 Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "✅ Build complete!"

