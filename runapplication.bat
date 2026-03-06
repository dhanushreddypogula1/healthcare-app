@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo  MediBook Healthcare System - Application Launcher
echo ============================================================
echo.

:: ─── Start Backend ──────────────────────────────────────────────────────────
echo [1/2] Starting FastAPI backend server...
call env\Scripts\activate

start "MediBook Backend" cmd /k "cd backend && python main.py"
echo  Backend starting at http://localhost:8000
echo  Swagger UI: http://localhost:8000/docs
echo.

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: ─── Start Frontend ─────────────────────────────────────────────────────────
echo [2/2] Starting React frontend...
start "MediBook Frontend" cmd /k "cd frontend && npm start"
echo  Frontend starting at http://localhost:3000
echo.

echo ============================================================
echo  Both servers are starting in separate windows.
echo  Close those windows to stop the application.
echo ============================================================
echo.
echo  Press any key to exit this launcher...
pause >nul
