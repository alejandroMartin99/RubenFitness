# Backend API - Rubén Fitness

FastAPI backend con Swagger, autenticación, chat IA y tracking de progreso.

## 🚀 Inicio Rápido

```bash
# Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

✅ API: http://localhost:8000  
📚 Swagger: http://localhost:8000/docs

## 🔧 Configuración

Copia `.env.example` a `.env` y agrega tus credenciales:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-service-role-key
OPENAI_API_KEY=tu-openai-key
CORS_ORIGINS=http://localhost:4200
```

**Nota**: Funciona sin credenciales en modo mock.

## 📊 Schema de Base de Datos

Ejecuta `supabase_schema.sql` en Supabase para crear todas las tablas.

## 📝 Endpoints

Ver documentación completa en http://localhost:8000/docs
