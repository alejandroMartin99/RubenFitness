# 🚀 Desplegar Backend en Render

Para que Vercel funcione, necesitas desplegar el backend en Render.

## 📋 Pasos

### 1. Crea cuenta en Render

Ve a [render.com](https://render.com) y crea una cuenta

### 2. Crear Web Service

1. Click en **"New"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura:

**IMPORTANTE**: La raíz del repositorio tiene `backend/` y `frontend/` como carpetas. Al poner `Root Directory: backend`, Render cambia a esa carpeta y ejecuta todos los comandos desde ahí.

   - **Name**: `ruben-fitness-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Cómo funciona**:
- Render entra en `backend/`
- `pip install -r requirements.txt` encuentra `backend/requirements.txt` ✅
- `uvicorn app.main:app` encuentra `backend/app/main.py` ✅

### 3. Variables de Entorno

Agrega estas variables en **Environment Variables**:

```
ENVIRONMENT=production
SUPABASE_URL=https://nymrsnhnzcagvwwnkyno.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkzMjc2NiwiZXhwIjoyMDc3NTA4NzY2fQ.ged_tdZwochk2HsYKlrIr2_ZLNERaclBrTvYzrXNrxs
OPENAI_API_KEY=tu-openai-key (opcional)
```

### 4. Deploy

Click en **"Create Web Service"** y espera a que termine el deploy

### 5. Obtener URL del Backend

Una vez deployado, Render te dará una URL como:

```
https://ruben-fitness-backend.onrender.com
```

### 6. Configurar variables en Vercel (Frontend)

El frontend genera `environment*.ts` automáticamente durante el build leyendo variables de entorno. Configúralas en Vercel:

1. Entra a **Settings → Environment Variables** del proyecto de Vercel.
2. Añade (Production y Preview):

```
API_URL=https://ruben-fitness-backend.onrender.com      # URL pública del backend en Render
SUPABASE_URL=https://nymrsnhnzcagvwwnkyno.supabase.co   # URL del proyecto Supabase
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0
```

El script `scripts/generate-env.js` las usará en el `prebuild`/`prestart` para generar `environment.ts` y `environment.prod.ts` sin editar archivos manualmente.

### 7. Redeploy Frontend en Vercel

Haz un nuevo commit y push a GitHub para redepleyar el frontend con esta configuración.

---

## ✅ Verificación

Después del deploy:

1. Verifica que el backend responde: `https://rubenfitness.onrender.com/health`
2. Verifica Swagger: `https://rubenfitness.onrender.com/docs`
3. Prueba el login en Vercel

---

**¡Listo!** Tu app debería funcionar ahora 🎉

