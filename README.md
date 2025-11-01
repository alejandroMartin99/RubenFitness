# 🏋️ Rubén Fitness - AI-Powered Training Platform

Plataforma de entrenamiento inteligente con asesoramiento por IA, seguimiento de progreso y dashboards diferenciados para usuarios y coaches.

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

**Login de prueba**: `tester@ruben.fitness` / `tester` o `admin@ruben.fitness` / `admin`

---

## 🎯 Características

### 👤 Dashboard Usuario/Tester
- Panel diario de entrenamiento
- Indicadores: pasos, agua, sueño
- Progreso y estadísticas
- Chat con asistente IA
- Logros y rachas

### 👨‍🏫 Dashboard Coach/Admin
- Gestión de clientes
- Métricas clave y riesgo de abandono
- Mensajes automatizados
- Generación de contenido social

---

## 📋 Stack Tecnológico

**Frontend**: Angular 18 + TypeScript + Tailwind CSS + Angular Material  
**Backend**: FastAPI + Python + Pydantic  
**Base de Datos**: Supabase (PostgreSQL)  
**IA**: OpenAI para chat  
**Notificaciones**: Firebase Cloud Messaging

---

## 🔧 Configuración

### Variables de Entorno

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-service-role-key
OPENAI_API_KEY=tu-openai-key
CORS_ORIGINS=http://localhost:4200
```

**Frontend** (`frontend/src/environments/environment.ts`):
```typescript
apiUrl: 'http://localhost:8000',
supabaseUrl: 'https://tu-proyecto.supabase.co',
supabaseKey: 'tu-anon-key'
```

### Conectar Supabase

**Pasos**:
1. Ya tienes proyecto: https://nymrsnhnzcagvwwnkyno.supabase.co
2. Ejecuta `SUPABASE_SETUP_SQL.txt` en Supabase SQL Editor
3. Backend ya configurado con credenciales en `.env`
4. Frontend ya configurado con credenciales en `environment.ts`

**Ver**: **[SUPABASE_CREDENTIALS.md](SUPABASE_CREDENTIALS.md)** para detalle de credenciales

**Nota**: Si no ejecutas el SQL, la app funciona en modo mock.

---

## 📁 Estructura

```
RubenFitness/
├── frontend/          # Angular 18
│   ├── src/app/
│   │   ├── core/      # Services, guards, models
│   │   └── features/  # Modules lazy: auth, dashboard, assistant, progress, coach
│   └── package.json
├── backend/           # FastAPI
│   ├── app/
│   │   ├── api/v1/    # Endpoints: auth, chat, progress
│   │   ├── services/  # Supabase, OpenAI
│   │   └── models/    # Schemas Pydantic
│   └── requirements.txt
├── supabase_schema.sql
└── README.md
```

---

## 🔌 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registro
- `POST /api/v1/auth/logout` - Cerrar sesión

### Chat IA
- `POST /api/v1/chat` - Enviar mensaje
- `GET /api/v1/chat/history/{user_id}` - Historial

### Progreso
- `POST /api/v1/progress` - Registrar entrenamiento
- `GET /api/v1/progress/{user_id}` - Resumen
- `GET /api/v1/progress/{user_id}/stats` - Estadísticas

**Docs**: http://localhost:8000/docs

---

## 🌐 Deploy

### Frontend (Vercel)

```bash
cd frontend
vercel login
vercel
```

**Importante**: Configura **Root Directory** = `frontend` en Vercel Dashboard

### Backend (Render/Railway)

1. Crea cuenta en [render.com](https://render.com) o [railway.app](https://railway.app)
2. Conecta GitHub
3. Root Directory: `backend`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🎨 Personalizar Colores

Edita `frontend/src/styles/variables.scss`:

```scss
:root {
  --color-primary: #3b82f6;   /* Tu color principal */
  --color-accent: #06b6d4;    /* Color accent */
}
```

---

## 🐛 Solución de Problemas

**Backend no inicia**:
- Verifica Python 3.10+
- Activa entorno virtual
- Reinstala: `pip install -r requirements.txt`

**Frontend no compila**:
- Node.js 18+
- Limpia: `rm -rf node_modules && npm install`

**CORS**:
- Backend en puerto 8000
- `CORS_ORIGINS` incluye `http://localhost:4200`

---

## ✅ Estado del Proyecto

**Completado (Hito 1-2)**:
- ✅ Estructura modular Angular 18 + FastAPI
- ✅ Autenticación completa con guards
- ✅ Dashboards diferenciados (Usuario/Coach)
- ✅ Chat IA funcional con OpenAI
- ✅ Tracking de progreso completo
- ✅ API documentada con Swagger
- ✅ Conexión Frontend ↔ Backend funcional
- ✅ Modo mock completamente operativo
- ✅ Sistema de fallback inteligente
- ✅ Todos los endpoints probados

**Pendiente**:
- ⏳ Ejecutar schema SQL en Supabase (ver SUPABASE_SETUP_SQL.txt)
- ⏳ Panel coach avanzado completo
- ⏳ Upload de fotos a Supabase Storage
- ⏳ Push notifications con Firebase
- ⏳ App móvil React Native

---

## 📚 Archivos Importantes

- `SUPABASE_SETUP_SQL.txt` - SQL para ejecutar en Supabase (COPIAR Y PEGAR)
- `SUPABASE_CREDENTIALS.md` - Tus credenciales configuradas
- `CONNECTION_STATUS.md` - Estado de conexión y troubleshooting
- `backend/supabase_schema.sql` - Schema completo (referencia)
- `backend/START_SERVER.md` - Instrucciones de inicio backend
- `backend/README.md` - Documentación backend
- `frontend/README.md` - Documentación frontend

---

**Built with ❤️ for fitness enthusiasts**
