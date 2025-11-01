# Backend API - Rubén Fitness

FastAPI con Supabase y OpenAI.

## 🚀 Inicio

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

✅ API: http://localhost:8000  
📚 Swagger: http://localhost:8000/docs

## ⚙️ Configuración

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://nymrsnhnzcagvwwnkyno.supabase.co
SUPABASE_KEY=tu-service-role-key
OPENAI_API_KEY=
```

**Nota**: Funciona sin credenciales en modo mock.

## 📝 Endpoints

Ver documentación en http://localhost:8000/docs
