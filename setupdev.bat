@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo  MediBook Healthcare System - Development Setup
echo ============================================================
echo.

:: ─── Backend Setup ─────────────────────────────────────────────────────────
echo [1/5] Creating Python virtual environment...
python -m venv env
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment. Is Python installed?
    exit /b 1
)

echo [2/5] Activating virtual environment and installing dependencies...
call env\Scripts\activate
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies.
    exit /b 1
)

echo [3/5] Running Alembic database migrations...
cd backend
alembic upgrade head
if errorlevel 1 (
    echo ERROR: Database migration failed.
    cd ..
    exit /b 1
)

echo [3b] Seeding initial data (optional)...
sqlite3 healthcare.db < seed_data.sql 2>nul || echo (sqlite3 not found - skip seeding, seed manually if needed)
cd ..

:: ─── Frontend Setup ─────────────────────────────────────────────────────────
echo [4/5] Installing frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Is Node.js installed?
    cd ..
    exit /b 1
)
cd ..

:: ─── SDK Setup ──────────────────────────────────────────────────────────────
echo [5/5] Installing OpenAPI Generator CLI for SDK generation...
npm install -g @openapitools/openapi-generator-cli 2>nul || echo (Optional: install Node.js to use SDK generator)

echo.
echo ============================================================
echo  Setup complete! Run runapplication.bat to start the app.
echo ============================================================
echo.
echo  Backend API will be at: http://localhost:8000
echo  Swagger UI will be at:  http://localhost:8000/docs
echo  Frontend will be at:    http://localhost:3000
echo.
