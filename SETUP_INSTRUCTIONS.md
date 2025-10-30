# Setup Instructions - Rubén Fitness

## ✅ Errores Corregidos

1. **Imports de Material faltantes** - Agregados en AuthModule y DashboardModule
2. **Configuración angular.json** - Eliminadas opciones incompatibles con Angular 18
3. **MatDividerModule** - Agregado a AppModule
4. **Build exitoso** - Proyecto compila correctamente

## 🚀 Inicio Rápido

### Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

Abre en: `http://localhost:4200`

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Abre en: `http://localhost:8000`

## 📝 Cambios Realizados

### Frontend
- ✅ Agregados imports de Material en módulos de features
- ✅ Corregida configuración de Angular 18 en angular.json
- ✅ Agregado MatDividerModule
- ✅ Importación correcta del tema de Material
- ✅ Build exitoso sin errores

### Backend
- ✅ Estructura completa creada
- ✅ Endpoints funcionales con mocks
- ✅ Documentación Swagger disponible

## 🎨 Personalizar Colores

Edita `frontend/src/styles/variables.scss` para cambiar la paleta.

## 📚 Documentación Completa

Ver `README.md` para documentación completa del proyecto.

---

## 🚀 Despliegue en Vercel

### ⚠️ IMPORTANTE: Configurar Root Directory

Vercel necesita que configures el **Root Directory** correctamente:

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. **Settings** → **General**
3. **Root Directory** → Cambia a `/frontend`
4. **Save**

### Configuración Automática

Ya existe `vercel.json` en la carpeta `frontend/` con esta configuración:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend/browser",
  "framework": "angular",
  "installCommand": "npm install"
}
```

### Deploy con CLI

```bash
cd frontend
vercel login
vercel
```

### Nota Importante

- **Frontend**: Se despliega en Vercel
- **Backend**: Se despliega en Render/Railway (NO en Vercel)
- **Base de Datos**: Supabase

Ver README.md para más detalles sobre el backend.


