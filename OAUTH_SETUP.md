# Configuración de OAuth para Producción

## Problema
Cuando se despliega en producción (Vercel), el OAuth de Google redirige a `http://localhost:3000` en lugar de la URL de producción.

## ⚠️ Problema Crítico Detectado

**El frontend está usando la `service_role` key en lugar de la `anon` key.**

Esto puede causar problemas con OAuth y es un riesgo de seguridad. El frontend **SIEMPRE** debe usar la clave **anon** (pública), nunca la service_role.

### Cómo verificar:
1. Ve a Supabase Dashboard > Settings > API
2. Copia la **anon/public** key (no la service_role)
3. Asegúrate de que esta clave esté en `environment.prod.ts` y `environment.ts`

### La clave correcta debe tener en el JWT:
- `"role":"anon"` ✅ (CORRECTO para frontend)
- `"role":"service_role"` ❌ (INCORRECTO para frontend - solo backend)

## Solución

### 1. Configurar URLs de Redirección en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** > **URL Configuration**

#### Site URL (URL Principal)
**Cambia el Site URL a tu URL de producción:**
```
https://ruben-fitness.vercel.app
```

⚠️ **IMPORTANTE:** No dejes `http://localhost:3000` como Site URL en producción. Esto puede causar que las redirecciones vayan a localhost.

#### Redirect URLs (URLs de Redirección Permitidas)
**Añade estas URLs exactas:**

**Para desarrollo:**
```
http://localhost:4200/auth/callback
http://localhost:3000/auth/callback
```

**Para producción (Vercel):**
```
https://ruben-fitness.vercel.app/auth/callback
```

**Ejemplo de configuración correcta:**
- Site URL: `https://ruben-fitness.vercel.app`
- Redirect URLs:
  - `http://localhost:4200/auth/callback`
  - `https://ruben-fitness.vercel.app/auth/callback`

### 2. Configurar Google OAuth en Supabase

1. En Supabase Dashboard, ve a **Authentication** > **Providers**
2. Habilita **Google**
3. Añade las **Authorized redirect URIs** en Google Cloud Console:
   - `https://[tu-proyecto-supabase].supabase.co/auth/v1/callback`
   - Esta URL la encontrarás en la configuración de Google OAuth en Supabase

### 3. Verificar Variables de Entorno en Vercel

#### Paso 1: Obtener la Clave Anon de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) > **API**
4. En la sección **Project API keys**, encontrarás dos claves:
   - **anon/public** key (esta es la que necesitas) ✅
   - **service_role** key (NO uses esta en el frontend) ❌

5. Copia la clave **anon/public** (empieza con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

#### Paso 2: Verificar la Clave Correcta

Para verificar que es la clave anon, puedes decodificar el JWT en [jwt.io](https://jwt.io):
- La clave anon debe tener: `"role":"anon"` ✅
- La service_role tiene: `"role":"service_role"` ❌

#### Paso 3: Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (`ruben-fitness` o el nombre que tenga)
3. Ve a **Settings** > **Environment Variables**
4. Busca o crea estas variables:

   **Variable 1:**
   - **Name:** `SUPABASE_URL`
   - **Value:** `https://nymrsnhnzcagvwwnkyno.supabase.co`
   - **Environment:** Production, Preview, Development (marca todas)

   **Variable 2:**
   - **Name:** `SUPABASE_ANON_KEY`
   - **Value:** [Pega aquí la clave **anon** que copiaste]
   - **Environment:** Production, Preview, Development (marca todas)

5. Haz clic en **Save** para cada variable

#### Paso 4: Verificar que se Está Usando Correctamente

1. Después de guardar, ve a **Deployments**
2. Si hay un deployment reciente, haz clic en los **3 puntos** > **Redeploy** para aplicar los cambios
3. O espera al próximo deployment automático

#### Paso 5: Verificar en el Código

El código en `frontend/scripts/generate-env.js` ya está configurado para leer `SUPABASE_ANON_KEY` de las variables de entorno de Vercel y generar los archivos `environment.prod.ts` automáticamente.

**⚠️ IMPORTANTE:** 
- El frontend **SIEMPRE** debe usar la clave **anon** (pública)
- La **service_role** solo debe usarse en el backend (Render)
- Nunca expongas la service_role en el frontend

### 4. Verificar el Código

El código ya está configurado para usar `window.location.origin + '/auth/callback'`, que debería funcionar automáticamente. Si sigue fallando:

1. Verifica que la URL de producción esté en la lista de Redirect URLs de Supabase
2. Verifica que Google OAuth tenga la URL de callback de Supabase configurada
3. Revisa la consola del navegador para ver qué URL se está usando

## Notas Importantes

- **Las URLs deben coincidir exactamente** (incluyendo protocolo http/https)
- **No uses wildcards** en Google OAuth, solo en Supabase Redirect URLs
- **Espera unos minutos** después de cambiar la configuración para que se propague

## Debugging

Si el problema persiste:

1. Abre la consola del navegador en producción
2. Busca el log: `OAuth redirect URL: [URL]`
3. Verifica que esa URL esté en la lista de Redirect URLs de Supabase
4. Verifica que Google OAuth tenga configurada la URL de callback de Supabase

