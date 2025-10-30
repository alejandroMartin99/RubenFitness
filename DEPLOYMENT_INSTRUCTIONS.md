# 🚀 Instrucciones de Despliegue - Vercel

## ⚠️ PROBLEMA COMÚN: Vercel no encuentra los archivos

### Solución

Vercel necesita que configures el **Root Directory** correctamente:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. **Settings** → **General** → **Root Directory**
3. Cambia de `/` a `/frontend`
4. **Save**
5. **Redeploy**

---

## 📁 Configuración de Vercel

### Opción 1: Dashboard de Vercel (Recomendado)

1. **Root Directory**: `frontend`
2. **Build Command**: `npm run build` (automático con Angular)
3. **Output Directory**: `dist/frontend/browser` 
4. **Install Command**: `npm install`

### Opción 2: CLI de Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

Responda a las preguntas:
- Set up and deploy? **Yes**
- Which scope? (selecciona tu cuenta)
- Link to existing project? **No**
- Project name? (presiona Enter o escribe uno)
- Directory? **./** (ya estás en frontend/)

---

## 🔧 Archivo vercel.json

Ya está creado en `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend/browser",
  "framework": "angular",
  "installCommand": "npm install"
}
```

**Nota**: El `outputDirectory` es `dist/frontend/browser` porque Angular 18 genera los archivos ahí.

---

## 📋 Variables de Entorno en Vercel

Configura estas variables en **Settings** → **Environment Variables**:

```
API_URL=https://tu-backend-render.herokuapp.com
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima
```

---

## ✅ Checklist

- [ ] Root Directory configurado como `frontend` en Vercel
- [ ] Build exitoso sin errores
- [ ] Variables de entorno configuradas
- [ ] URL pública funciona
- [ ] Backend desplegado en Render/Railway
- [ ] Conexión entre frontend y backend funcionando

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Verifica Root Directory: debe ser `frontend`
- Limpia build: `cd frontend && rm -rf dist .angular`

### Error: "Output directory not found"
- Asegúrate que Output Directory sea `dist/frontend/browser`
- Verifica que el build local funcione: `npm run build`

### Error: CORS
- Configura `CORS_ORIGINS` en tu backend con la URL de Vercel
- Ejemplo: `https://tu-proyecto.vercel.app`

### Build lento
- Vercel puede tardar 2-3 minutos en instalar dependencias
- Si falla, verifica que `package.json` esté correcto

---

## 📱 Backend (Render/Railway)

**El backend NO se despliega en Vercel**. Debes usar:

- **Render**: https://render.com (gratis con límites)
- **Railway**: https://railway.app (gratis con límites)
- **Fly.io**: https://fly.io (gratis con límites)

### Render (Recomendado)

1. Crea cuenta en Render
2. **New** → **Web Service**
3. Conecta tu repositorio GitHub
4. **Root Directory**: `backend`
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Agrega variables de entorno (SUPABASE_URL, OPENAI_API_KEY, etc.)

---

## 🎯 URLs de Ejemplo

- **Frontend Vercel**: `https://ruben-fitness.vercel.app`
- **Backend Render**: `https://ruben-fitness-backend.onrender.com`
- **API Docs**: `https://ruben-fitness-backend.onrender.com/docs`

---

✅ **¡Listo!** Tu app debería funcionar correctamente.

