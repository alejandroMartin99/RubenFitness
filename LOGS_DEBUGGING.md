# Guía de Logs y Debugging

## Dónde Ver los Logs

### 1. 🔍 Consola del Navegador (Frontend - Más Importante)

**Cómo acceder:**
1. Abre tu aplicación en el navegador (Chrome, Firefox, Edge)
2. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Option+I` (Mac)
3. Ve a la pestaña **Console**

**Qué verás:**
- ✅ Logs de éxito: `[API] GET https://... - Success`
- ❌ Errores: `[API Error]` con detalles completos
- ⚠️ Advertencias y otros logs

**Ejemplo de error que verás:**
```javascript
[API Error] Bad Request {
  url: "https://rubenfitness.onrender.com/api/v1/chat/message",
  endpoint: "/api/v1/chat/message",
  status: 400,
  statusText: "Bad Request",
  message: "Error message from server",
  error: { detail: "More details..." }
}
```

**Filtros útiles:**
- Filtra por `[API]` para ver solo peticiones API
- Filtra por `Error` para ver solo errores
- Usa `Ctrl+F` para buscar texto específico

### 2. 📊 Vercel Logs (Frontend - Deployment)

**Cómo acceder:**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña **Deployments**
4. Haz clic en el deployment más reciente
5. Ve a la pestaña **Logs** o **Functions**

**Qué verás:**
- Logs del build
- Errores de compilación
- Errores en tiempo de ejecución (si hay serverless functions)

**Nota:** Para una SPA (Single Page Application) como Angular, la mayoría de los errores se verán en la consola del navegador, no en Vercel.

### 3. 🖥️ Render Logs (Backend - API)

**Cómo acceder:**
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio (backend)
3. Ve a la pestaña **Logs**

**Qué verás:**
- Logs del servidor FastAPI
- Errores de la API
- Requests y responses
- Errores de conexión a Supabase

**Filtros útiles:**
- Busca por `ERROR` para ver solo errores
- Busca por el endpoint específico (ej: `/api/v1/chat`)
- Busca por `Traceback` para ver errores de Python

### 4. 📱 Network Tab (Navegador - Peticiones HTTP)

**Cómo acceder:**
1. Abre DevTools (`F12`)
2. Ve a la pestaña **Network**
3. Recarga la página o realiza la acción que causa el error

**Qué verás:**
- Todas las peticiones HTTP
- Status codes (200, 400, 500, etc.)
- Request/Response headers y body
- Tiempo de respuesta

**Cómo usar:**
1. Filtra por `XHR` o `Fetch` para ver solo peticiones API
2. Haz clic en una petición fallida (roja) para ver detalles
3. Ve a la pestaña **Response** para ver el mensaje de error del servidor
4. Ve a la pestaña **Headers** para ver los headers enviados

## Tipos de Errores Comunes

### Error 0 / Network Error
**Causa:** No se puede conectar con el servidor
**Solución:**
- Verifica que el backend esté corriendo en Render
- Verifica la URL en `environment.prod.ts`: `apiUrl: 'https://rubenfitness.onrender.com'`
- Verifica CORS en el backend

### Error 400 (Bad Request)
**Causa:** Datos inválidos enviados al servidor
**Solución:**
- Revisa el Request en Network tab
- Verifica que los datos sean correctos
- Revisa los logs del backend en Render

### Error 401 (Unauthorized)
**Causa:** Token de autenticación inválido o expirado
**Solución:**
- Verifica que el usuario esté autenticado
- Verifica que el token se esté enviando en los headers
- Intenta hacer logout y login nuevamente

### Error 404 (Not Found)
**Causa:** El endpoint no existe
**Solución:**
- Verifica que la URL del endpoint sea correcta
- Verifica que el backend tenga ese endpoint definido
- Revisa los logs del backend

### Error 500 (Internal Server Error)
**Causa:** Error en el servidor
**Solución:**
- Revisa los logs del backend en Render
- Busca el traceback del error
- Verifica las variables de entorno en Render

### Error CORS
**Causa:** El backend no permite peticiones desde el frontend
**Solución:**
- Verifica la configuración de CORS en `backend/app/main.py`
- Asegúrate de que la URL de Vercel esté permitida
- En producción, el código ya permite todos los orígenes (`cors_origins = ["*"]`)

## Mejores Prácticas para Debugging

### 1. Siempre Revisa la Consola del Navegador Primero
La mayoría de los errores del frontend aparecen aquí con detalles completos.

### 2. Usa el Network Tab para Ver Peticiones
Te muestra exactamente qué se está enviando y recibiendo.

### 3. Revisa los Logs del Backend para Errores 500
Los errores del servidor aparecen en Render con el traceback completo.

### 4. Filtra los Logs
Usa los filtros en cada herramienta para encontrar rápidamente lo que buscas.

### 5. Copia los Errores Completos
Cuando reportes un error, copia el mensaje completo incluyendo:
- URL del endpoint
- Status code
- Mensaje de error
- Stack trace (si está disponible)

## Ejemplo de Debugging Completo

1. **Abre la consola del navegador** (`F12` > Console)
2. **Reproduce el error** (ej: enviar un mensaje en el chat)
3. **Busca el error en la consola:**
   ```
   [API Error] Bad Request {
     url: "https://rubenfitness.onrender.com/api/v1/chat/message",
     status: 400,
     message: "Invalid user_id"
   }
   ```
4. **Ve al Network tab** y busca la petición fallida
5. **Revisa el Response** para ver el mensaje completo del servidor
6. **Si es un error 500, revisa Render logs** para ver el traceback
7. **Corrige el problema** basándote en la información encontrada

## Variables de Entorno Importantes

Asegúrate de que estas variables estén configuradas correctamente:

**Vercel (Frontend):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**Render (Backend):**
- `SUPABASE_URL`
- `SUPABASE_KEY` (service_role)
- `OPENAI_API_KEY`
- `ENVIRONMENT=production`

