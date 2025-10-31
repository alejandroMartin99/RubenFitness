@echo off
echo Starting Ruben Fitness Backend Server...
cd /d %~dp0
call .venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
pause

