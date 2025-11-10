#!/bin/bash
# Build script for Render with Tesseract OCR support
# This script installs Tesseract OCR and Python dependencies

set -e  # Exit on error

echo "🔧 Installing system dependencies (Tesseract OCR)..."
apt-get update
apt-get install -y tesseract-ocr

echo "📦 Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "✅ Build complete! OCR should be available."

