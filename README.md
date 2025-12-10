# 🏋️ Rubén Fitness
Plataforma de entrenamiento con IA, seguimiento de progreso (entrenos, composición corporal, fotos), dashboards y motivación.

---

## Contenido
- Prerrequisitos
- Configuración rápida (backend / frontend)
- Variables de entorno (solicita el `.env` al owner)
- Supabase (SQL y tablas completas)
- OAuth Google (resumen)
- Deploy (Render / Vercel)
- Composición corporal y perfil
- Endpoints principales
- Limpieza de caché
- Troubleshooting

---

## Prerrequisitos
- Node.js 18+ y npm
- Python 3.11+
- Supabase (proyecto activo)
- Claves de entorno (pídelas al owner; el `.env` no se sube)

---

## Backend (FastAPI)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Swagger: http://localhost:8000/docs

### .env backend (ejemplo)
> Solicita las credenciales reales al owner.  
```
SUPABASE_URL=...
SUPABASE_KEY=...          # service_role
SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
JWT_SECRET=...
```

---

## Frontend (Angular 18)
```bash
cd frontend
npm install
npm start
```
App: http://localhost:4200

---

## Supabase
1) En tu proyecto Supabase, abre SQL Editor.  
2) Copia todo `SUPABASE_SETUP_SQL.txt` y ejecútalo. Incluye:
   - `user_profiles` (peso, %grasa, masa muscular, datos personales)
   - `body_composition` (histórico diario, UNIQUE user_id+date)
   - `progress`, `workouts`, `exercises`, `habits`, `habit_logs`, `coach_clients`
   - `achievements`, `streaks`, `progress_photos`
   - `chat_conversations` + `chat_messages`
   - `daily_health_data` (sueño/agua) y `workout_days` (calendario)
   - Índices y RLS para todas
3) Desactiva email confirmation si quieres login directo (Auth → Providers → Email → desmarcar “Confirm email”).

---

## Composición corporal y perfil
- `body_composition`: histórico diario (peso, %grasa, masa muscular), upsert por usuario/fecha.
- `user_profiles`: última medición + datos personales.  
- Al guardar una medición desde Progress se actualiza también el perfil.  
- Al leer el perfil se muestra la última medición disponible.

---

## OAuth Google (resumen)
1) Google Cloud Console:
   - Crea proyecto, habilita Google+ API.
   - Pantalla de consentimiento (externo), añade usuario de prueba si aplica.
   - Crea credenciales OAuth (web). Redirects:
     ```
     https://<tu-proyecto>.supabase.co/auth/v1/callback
     http://localhost:4200/auth/callback
     ```
   - Copia Client ID y Client Secret.
2) Supabase → Authentication → Providers → Google:
   - Activa toggle, pega Client ID y Secret.
   - Site/Redirect URLs: `http://localhost:4200` y `http://localhost:4200/auth/callback` (agrega prod).
3) Prueba en `/auth/login` o `/auth/register` con “Continue with Google”.

---

## Deploy (Render / Vercel)
Backend (Render):
- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Vars: `SUPABASE_URL`, `SUPABASE_KEY` (service_role), `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `ENVIRONMENT=production`

Frontend (Vercel):
- Build: `cd frontend && npm install && npm run build`
- Output: `frontend/dist/frontend/browser`
- Rewrites a `/index.html` (ver `vercel.json`)
- Vars: `API_URL` (backend deploy), `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## Endpoints principales
- Auth: `/api/v1/auth/login`, `/register`, `/logout`
- Progress:
  - `POST /api/v1/progress/log-workout`
  - `DELETE /api/v1/progress/{progress_id}`
  - `GET /api/v1/progress/{user_id}` resumen
  - `POST /api/v1/progress/body-comp` (historical) / `GET /api/v1/progress/{user_id}/body-comp`
  - `GET /api/v1/progress/{user_id}/last?type=...`
- Perfil: `GET/POST /api/v1/profile`
- Chat IA: `/api/v1/chat`, `/api/v1/chat/history/{user_id}`
- Logros/Fotos/Rachas se gestionan vía `progress.service` en frontend y tablas `achievements`, `progress_photos`, `streaks`.

---

## Limpieza de caché (frontend)
1) Borrar `.angular`, `dist`, `node_modules/.cache` en `frontend/`.
2) Limpiar caché del navegador o usar incógnito.
3) Hard reload (Ctrl+Shift+R).

---

## Troubleshooting
- Backend no arranca: activa `.venv`, reinstala requirements.
- 500 Supabase: revisa `.env` (service_role) y ejecuta el SQL actualizado.
- OAuth Google/Apple: revisa redirect `http://<host>/auth/callback` en Supabase.
- Si algo no carga tras logout/login, limpia `localStorage` y recarga duro (Ctrl+Shift+R).

---

**Built with ❤️ for fitness enthusiasts**
