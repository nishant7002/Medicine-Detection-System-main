@echo off
echo ========================================
echo   Installing OCR Dependencies
echo ========================================
echo.

echo Step 1: Installing pytesseract...
pip install pytesseract

echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Install Tesseract OCR:
echo    Download from: https://github.com/UB-Mannheim/tesseract/wiki
echo.
echo 2. After installing Tesseract, run:
echo    python app.py
echo.
echo 3. If you see "OCR_AVAILABLE: False", configure the path:
echo    Edit app.py and uncomment line with tesseract_cmd
echo.
echo For detailed instructions, see OCR_SETUP.md
echo.

pause

