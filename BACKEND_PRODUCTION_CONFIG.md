# Configuración del Backend para Producción

## ✅ Cambios Realizados

### 1. Configuración de CORS (`backend/app/core/config.py`)

**Antes:**
```python
CORS_ORIGINS: List[str] = ["http://localhost:4200", "http://localhost:3000"]
```

**Ahora:**
```python
CORS_ORIGINS: List[str] = [
    "http://localhost:4200",
    "http://localhost:3000",
    "https://ruben-fitness.vercel.app",
    "https://*.vercel.app"  # Allow all Vercel preview deployments
]
```

### 2. Lógica de Producción Mejorada (`backend/app/main.py`)

**Mejoras:**
- Detecta producción por `ENVIRONMENT=production` o `ENV=production`
- En producción, usa `["*"]` para permitir todas las URLs (incluye Vercel previews)
- Añade logging para debug: muestra qué modo está activo

**Código:**
```python
is_production = os.getenv("ENVIRONMENT") == "production" or os.getenv("ENV") == "production"

if is_production:
    cors_origins = ["*"]
    print(f"[CORS] Production mode: Allowing all origins")
else:
    print(f"[CORS] Development mode: Allowing origins: {cors_origins}")
```

## 🔍 Verificación

### Frontend (Vercel)
- ✅ `apiUrl: 'https://rubenfitness.onrender.com'` en `environment.prod.ts`
- ✅ No hay referencias a localhost en producción

### Backend (Render)
- ✅ CORS configurado para permitir todas las URLs en producción
- ✅ URLs de localhost solo para desarrollo
- ✅ URL de producción añadida a la lista por defecto

## 📋 Variables de Entorno en Render

Asegúrate de que en Render esté configurada:

**Variable requerida:**
- `ENVIRONMENT=production` (o `ENV=production`)

**Opcional (para CORS personalizado):**
- `CORS_ORIGINS=https://ruben-fitness.vercel.app,https://*.vercel.app` (comma-separated)

Si no se configura `ENVIRONMENT=production`, el backend usará los CORS por defecto que incluyen la URL de producción.

## 🧪 Cómo Verificar que Funciona

### 1. Verificar CORS en Producción

1. Abre la consola del navegador en producción
2. Ve a Network tab
3. Realiza una petición (ej: enviar mensaje en chat)
4. Verifica que no haya errores CORS
5. En los headers de la respuesta, deberías ver:
   ```
   Access-Control-Allow-Origin: *
   ```

### 2. Verificar Logs del Backend

En Render logs, deberías ver al iniciar:
```
[CORS] Production mode: Allowing all origins
```

O en desarrollo:
```
[CORS] Development mode: Allowing origins: ['http://localhost:4200', ...]
```

### 3. Probar una Petición

Desde la consola del navegador en producción:
```javascript
fetch('https://rubenfitness.onrender.com/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Debería devolver: `{status: "healthy"}` sin errores CORS.

## 🐛 Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** El backend no está detectando que está en producción

**Solución:**
1. Verifica que en Render esté configurada: `ENVIRONMENT=production`
2. Reinicia el servicio en Render
3. Verifica los logs para ver qué modo está usando

### Error: "Network Error" o "Failed to fetch"

**Causa:** El backend no está accesible o la URL es incorrecta

**Solución:**
1. Verifica que `apiUrl` en `environment.prod.ts` sea: `https://rubenfitness.onrender.com`
2. Verifica que el servicio en Render esté corriendo
3. Prueba acceder directamente: `https://rubenfitness.onrender.com/health`

### Las peticiones funcionan en local pero no en producción

**Causa:** Variables de entorno no configuradas en Render

**Solución:**
1. Verifica todas las variables de entorno en Render
2. Especialmente: `ENVIRONMENT=production`
3. Reinicia el servicio después de cambiar variables

## 📝 Resumen

- ✅ **CORS configurado** para producción y desarrollo
- ✅ **URLs de producción** añadidas a la configuración
- ✅ **Detección automática** de entorno (producción vs desarrollo)
- ✅ **Logging** para facilitar debugging
- ✅ **Frontend** ya apunta a la URL correcta del backend

No hay más referencias a localhost que necesiten cambiarse. El código ya está preparado para producción.

