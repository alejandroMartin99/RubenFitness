#!/bin/bash
echo "Starting Ruben Fitness Platform..."
echo ""

echo "[1/2] Starting Backend..."
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 3

echo "[2/2] Starting Frontend..."
cd frontend
npm start &
cd ..

echo ""
echo "========================================"
echo "Backend:  http://localhost:8000"
echo "Swagger:  http://localhost:8000/docs"
echo "Frontend: http://localhost:4200"
echo "========================================"
echo ""
echo "Login: tester@ruben.fitness / tester"
echo ""
echo "Press Ctrl+C to stop all servers"

wait $BACKEND_PID

