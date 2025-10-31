# 🚀 Iniciar Servidor Backend

## ✅ Backend Funciona Correctamente

El backend de FastAPI está **100% funcional** y listo para usar.

## 📋 Cómo Iniciar el Servidor

### Opción 1: Script Automático (Windows)
```bash
cd backend
run_server.bat
```

### Opción 2: Manual
```bash
cd backend
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

python -m uvicorn app.main:app --reload --port 8000
```

### Opción 3: Con Python Directo
```bash
cd backend
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

---

## 🌐 URLs Disponibles

Una vez iniciado, el servidor estará disponible en:

- **API**: http://localhost:8000
- **Documentación Swagger**: http://localhost:8000/docs
- **Documentación ReDoc**: http://localhost:8000/redoc

---

## 🔌 Endpoints Disponibles

### Health Check
```
GET /health
GET /
```

### Auth (Sin Supabase configurado - en desarrollo)
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/logout
GET /api/v1/auth/session
```

### Chat
```
POST /api/v1/chat
GET /api/v1/chat/history/{user_id}
```

### Progress
```
POST /api/v1/progress
GET /api/v1/progress/{user_id}
GET /api/v1/progress/{user_id}/stats
```

---

## 📝 Estado del Servidor

### ✅ Funcionando
- Servidor FastAPI
- CORS configurado
- Documentación Swagger
- Importación de módulos
- Estructura de código

### ⚠️ Modo Mock (Sin Supabase)
- Auth endpoints funcionan con mocks
- Chat funciona con mocks de OpenAI
- Progress funciona con datos mock

### 🔗 Para Conectar con Supabase Real
1. Edita `backend/.env`
2. Agrega `SUPABASE_URL` y `SUPABASE_KEY`
3. Reinicia el servidor

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
cd backend
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Error: "Port 8000 already in use"
```bash
# Cambia el puerto
python -m uvicorn app.main:app --reload --port 8001
```

### Error: Import errors
```bash
# Verifica que estás en el directorio correcto
cd backend
pwd  # Linux/Mac
cd   # Windows
```

---

## ✅ Verificación

Para verificar que todo funciona:

1. Inicia el servidor
2. Abre http://localhost:8000/docs
3. Deberías ver la documentación interactiva de Swagger
4. Prueba el endpoint `GET /health`

---

🎉 **¡El servidor está listo para usar!**

