# 🚀 Desplegar Backend en Render

Para que Vercel funcione, necesitas desplegar el backend en Render.

## 📋 Pasos

### 1. Crea cuenta en Render

Ve a [render.com](https://render.com) y crea una cuenta

### 2. Crear Web Service

1. Click en **"New"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `ruben-fitness-backend` (o el que prefieras)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

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

### 6. Actualizar Frontend

Edita `frontend/src/environments/environment.prod.ts` y cambia:

```typescript
apiUrl: 'https://ruben-fitness-backend.onrender.com',
```

### 7. Redeploy Frontend en Vercel

Haz un nuevo commit y push a GitHub para redepleyar el frontend con la nueva configuración

---

## ✅ Verificación

Después del deploy:

1. Verifica que el backend responde: `https://tu-backend.onrender.com/health`
2. Verifica Swagger: `https://tu-backend.onrender.com/docs`
3. Prueba el login en Vercel

---

**¡Listo!** Tu app debería funcionar ahora 🎉

