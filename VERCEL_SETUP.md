# ✅ Configuración Vercel - SOLUCIÓN COMPLETA

## 🎯 El Problema

Vercel no encuentra los archivos correctamente porque:
- Angular 18 genera archivos en `dist/frontend/browser/`
- Vercel necesita saber dónde buscar los archivos compilados
- Hay que configurar el **Root Directory** correctamente

---

## 🚀 SOLUCIÓN 1: Dashboard de Vercel (Más Fácil)

### Paso 1: Crear/Conexionar Proyecto
1. Ve a [vercel.com](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Importa tu repositorio de GitHub

### Paso 2: Configurar Settings
Cuando conectes el repo, verás esta pantalla. **IMPORTANTE**:

```
Project Name: ruben-fitness (o el que quieras)
Framework Preset: Other
Root Directory: frontend  ← ⚠️ CAMBIA ESTO
```

### Paso 3: Configurar Variables de Entorno
**Settings** → **Environment Variables**:

```
API_URL = https://tu-backend.onrender.com
SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY = tu_clave_publica
```

### Paso 4: Deploy
Click **Deploy** y espera 2-3 minutos.

---

## 🔧 SOLUCIÓN 2: CLI de Vercel

Si prefieres usar la terminal:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Ir a la carpeta frontend
cd frontend

# Login
vercel login

# Deploy
vercel
```

Responder:
- Set up and deploy? → **Yes**
- Link to existing? → **No**
- Project name? → **Enter** (o escribe uno)
- Directory? → **./** (presiona Enter, ya estás en frontend/)

---

## 📁 Archivos de Configuración

### Ya están creados:

**1. `vercel.json` en la raíz** (usa este si Root Directory NO funciona):
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist/frontend/browser",
  "installCommand": "cd frontend && npm install",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**2. `frontend/vercel.json`** (si usas Root Directory = frontend):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend/browser",
  "framework": "angular",
  "installCommand": "npm install"
}
```

---

## ✅ Verificar que Funciona

### Build Local (Antes de Deploy)
```bash
cd frontend
npm run build
# Verifica que dist/frontend/browser/index.html exista
```

### Después del Deploy en Vercel
1. Ve a tu deployment
2. Click en la URL (ej: `https://ruben-fitness.vercel.app`)
3. Deberías ver el login de tu app
4. Abre DevTools → Network
5. Verifica que no haya errores 404

---

## 🐛 Errores Comunes

### ❌ "Cannot find module"
**Causa**: Root Directory incorrecto
**Solución**: Settings → Root Directory → `frontend`

### ❌ "Output directory not found"
**Causa**: Output Directory incorrecto
**Solución**: `dist/frontend/browser` (para Angular 18)

### ❌ Build timeout
**Causa**: npm install tarda mucho
**Solución**: Espera 3-5 minutos, es normal la primera vez

### ❌ CORS errors
**Causa**: Backend no tiene la URL de Vercel
**Solución**: Agrega tu URL de Vercel a `CORS_ORIGINS` en el backend

---

## 📋 Checklist Final

- [ ] Repositorio conectado a Vercel
- [ ] Root Directory = `frontend`
- [ ] Output Directory = `dist/frontend/browser`
- [ ] Variables de entorno configuradas
- [ ] Build exitoso en Vercel
- [ ] URL pública funciona
- [ ] Backend desplegado (Render/Railway)
- [ ] Conexión frontend-backend funciona

---

## 🎉 ¡Listo!

Tu frontend debería estar funcionando en Vercel.

**Próximo paso**: Configurar el backend en Render/Railway (ver [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md))

---

💡 **Tip**: Si tienes problemas, revisa los **Logs** en Vercel Dashboard → Deployments → Click en tu deployment → Logs

