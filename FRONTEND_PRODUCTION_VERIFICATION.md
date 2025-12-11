# Verificación de Configuración del Frontend en Producción

## Problema
Los servicios no funcionan en el despliegue (producción). Puede ser que se esté usando localhost en lugar de la URL de producción.

## ✅ Verificación Rápida

### 1. Verificar en la Consola del Navegador

Abre la consola del navegador en producción (`F12` > Console) y busca estos logs al cargar la página:

```
[API Service] Initialized with API URL: https://rubenfitness.onrender.com
[API Service] Environment: production
```

**Si ves:**
- `http://localhost:8000` → ❌ **PROBLEMA**: Está usando desarrollo
- `https://rubenfitness.onrender.com` → ✅ **CORRECTO**

### 2. Verificar Variables de Entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Verifica que estén configuradas:
   - `API_URL` o `BACKEND_URL` = `https://rubenfitness.onrender.com`
   - `SUPABASE_URL` = `https://nymrsnhnzcagvwwnkyno.supabase.co`
   - `SUPABASE_ANON_KEY` = (tu clave anon)

### 3. Verificar el Build en Vercel

1. Ve a **Deployments**
2. Haz clic en el último deployment
3. Ve a la pestaña **Build Logs**
4. Busca esta línea:
   ```
   ✅ Generado: environment.prod.ts
   ```
5. Verifica que el script `prebuild` se ejecutó:
   ```
   🔄 Generando archivos environment desde .env...
   ```

### 4. Verificar el Archivo Generado

Si tienes acceso al código desplegado, verifica que `environment.prod.ts` tenga:
```typescript
apiUrl: 'https://rubenfitness.onrender.com',
```

## 🔧 Solución si Está Usando Localhost

### Opción 1: Configurar Variable de Entorno en Vercel

1. Ve a **Settings** > **Environment Variables**
2. Añade o edita:
   - **Name:** `API_URL`
   - **Value:** `https://rubenfitness.onrender.com`
   - **Environment:** Production, Preview, Development (marca todas)
3. Haz clic en **Save**
4. Ve a **Deployments** > **Redeploy**

### Opción 2: Verificar que el Build Use Producción

En `vercel.json` o en la configuración del proyecto, asegúrate de que el build command sea:
```json
{
  "buildCommand": "cd frontend && npm run build"
}
```

Y que `package.json` tenga:
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-env.js",
    "build": "ng build --configuration production"
  }
}
```

## 🧪 Prueba Rápida

Abre la consola del navegador en producción y ejecuta:

```javascript
// Verificar qué URL está usando
console.log('API URL:', window.location.origin);

// Probar una petición
fetch('https://rubenfitness.onrender.com/test')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Backend responde:', data);
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
```

## 📋 Checklist

- [ ] Variables de entorno configuradas en Vercel
- [ ] `API_URL` o `BACKEND_URL` apunta a `https://rubenfitness.onrender.com`
- [ ] El build log muestra que se generó `environment.prod.ts`
- [ ] La consola del navegador muestra la URL correcta
- [ ] Las peticiones funcionan sin errores CORS
- [ ] El backend responde en `/test`

## 🐛 Debugging

Si sigue sin funcionar:

1. **Revisa los logs del build en Vercel:**
   - ¿Se ejecutó `prebuild`?
   - ¿Hay errores al generar los environments?

2. **Revisa la consola del navegador:**
   - ¿Qué URL muestra `[API Service]`?
   - ¿Hay errores de red?

3. **Revisa Network tab:**
   - ¿A qué URL se están haciendo las peticiones?
   - ¿Qué status code devuelven?

4. **Verifica el código desplegado:**
   - Si puedes acceder al código, verifica `environment.prod.ts`
   - Debe tener `apiUrl: 'https://rubenfitness.onrender.com'`

## 📝 Notas

- El script `generate-env.js` se ejecuta automáticamente antes del build (`prebuild`)
- Lee las variables de entorno de Vercel y genera los archivos environment
- En producción, Angular usa `environment.prod.ts` (configurado en `angular.json`)
- Todos los servicios usan `ApiService` que lee `environment.apiUrl`


