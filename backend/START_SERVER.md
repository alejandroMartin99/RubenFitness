# 🚀 Iniciar Backend

## Inicio Rápido

```bash
cd backend
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac

uvicorn app.main:app --reload --port 8000
```

✅ API: http://localhost:8000  
📚 Swagger: http://localhost:8000/docs

## Scripts

**Windows**: `run_server.bat`  
**Linux/Mac**: `run_server.sh`

## Endpoints

- Health: `GET /health`
- Auth: `/api/v1/auth/*`
- Chat: `/api/v1/chat`
- Progress: `/api/v1/progress/*`

Ver todos en Swagger: http://localhost:8000/docs
