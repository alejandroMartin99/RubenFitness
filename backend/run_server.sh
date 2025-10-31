#!/bin/bash
echo "Starting Ruben Fitness Backend Server..."
cd "$(dirname "$0")"
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000

