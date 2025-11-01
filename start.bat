@echo off
echo Starting Ruben Fitness Platform...
echo.

echo [1/2] Starting Backend...
start cmd /k "cd backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Backend:  http://localhost:8000
echo Swagger:  http://localhost:8000/docs
echo Frontend: http://localhost:4200
echo ========================================
echo.
echo Login: tester@ruben.fitness / tester
echo.
pause

