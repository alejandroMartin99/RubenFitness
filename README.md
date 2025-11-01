# 🏋️ Rubén Fitness - AI-Powered Training Platform

Plataforma de entrenamiento inteligente con IA, seguimiento de progreso y dashboards diferenciados.

---

## 🚀 Inicio Rápido

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

✅ Backend: http://localhost:8000  
📚 Swagger: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm start
```

✅ Frontend: http://localhost:4200

**Login**: `tester@ruben.fitness` / `tester` o `admin@ruben.fitness` / `admin`

---

## 🔧 Configuración Supabase

### 1. Ejecutar SQL

1. Abre: https://app.supabase.com/project/nymrsnhnzcagvwwnkyno
2. Ve a **SQL Editor**
3. Copia TODO el contenido de `SUPABASE_SETUP_SQL.txt`
4. Pega y haz clic en **Run**
5. Debería decir "Success"

### 2. Desactivar Email Confirmation (Opcional)

1. Dashboard > **Authentication** > **Providers** > **Email**
2. Desmarca **"Confirm email"**
3. **Save**

### 3. Configurar Google OAuth (Opcional)

Ver instrucciones en backend/docs/GOOGLE_OAUTH.md

---

## 📋 Stack

**Frontend**: Angular 18 + TypeScript + Tailwind + Material  
**Backend**: FastAPI + Python + Supabase  
**IA**: OpenAI  
**Base de Datos**: Supabase (PostgreSQL)

---

## 🔌 API Endpoints

**Autenticación**:
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/logout` - Logout

**Chat IA**:
- `POST /api/v1/chat` - Enviar mensaje
- `GET /api/v1/chat/history/{user_id}` - Historial

**Progreso**:
- `POST /api/v1/progress` - Registrar entrenamiento
- `GET /api/v1/progress/{user_id}` - Resumen

📚 **Docs completas**: http://localhost:8000/docs

---

## ✅ Estado

**Completado**:
- ✅ Estructura completa
- ✅ Autenticación con guards
- ✅ Dashboards diferenciados
- ✅ Chat IA funcional
- ✅ Progress tracking
- ✅ API documentada
- ✅ Supabase integrado

**Pendiente**:
- ⏳ Google OAuth (código listo, faltando config)
- ⏳ Upload de fotos
- ⏳ Notificaciones push
- ⏳ App móvil

---

## 🐛 Troubleshooting

**Backend no inicia**: Activa `.venv` y reinstala dependencias  
**Frontend no compila**: Node.js 18+ y `npm install`  
**Supabase no conecta**: Verifica `backend/.env` con service_role key

---

**Built with ❤️ for fitness enthusiasts**
