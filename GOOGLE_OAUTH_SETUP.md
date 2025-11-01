# 🔐 Configurar Google OAuth en Supabase

Para habilitar "Sign in with Google" en tu aplicación, necesitas configurar Google OAuth en tu proyecto de Supabase.

## ⚠️ Estado Actual

**Google OAuth está implementado en el código**, pero necesita configuración en Supabase Dashboard.

## 📋 Pasos Completo

### 1️⃣ Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **Selecciona tu proyecto** o crea uno nuevo
3. **Habilita Google+ API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google+ API" o "People API"
   - Haz clic en "Enable"

### 2️⃣ Crear Credenciales OAuth 2.0

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en **"Create Credentials"** > **"OAuth client ID"**
3. Si te pide configurar pantalla de consentimiento:
   - Completa la pantalla de consentimiento (User Type: External)
   - App name: Rubén Fitness
   - User support email: tu email
   - Save and continue
4. Selecciona **"Web application"**
5. Configura:
   - **Name**: `Rubén Fitness Web`
   - **Authorized JavaScript origins**:
     ```
     https://nymrsnhnzcagvwwnkyno.supabase.co
     http://localhost:4200
     ```
   - **Authorized redirect URIs**:
     ```
     https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback
     ```
6. Haz clic en **"Create"**
7. **Copia y guarda**:
   - Client ID
   - Client Secret

### 3️⃣ Configurar en Supabase

1. Ve a tu [Supabase Dashboard](https://app.supabase.com/project/nymrsnhnzcagvwwnkyno)
2. Navega a: **Authentication** > **Providers**
3. Busca **"Google"** y haz clic
4. Configura:
   - ✅ **Enable Google provider** (toggle ON)
   - **Client ID**: Pega el Client ID de Google
   - **Client Secret**: Pega el Client Secret de Google
5. Haz clic en **Save**

### 4️⃣ Configurar Redirect URLs

1. En Supabase Dashboard, ve a: **Settings** > **URL Configuration**
2. Agrega a **Redirect URLs**:
   ```
   http://localhost:4200/dashboard
   http://localhost:4200/auth/callback
   ```

### 5️⃣ Activar Código en Login

Una vez configurado en Supabase, edita:
- `frontend/src/app/features/auth/login/login.component.ts`
- Descomenta las líneas marcadas con "// Uncomment when..."

### 6️⃣ ¡Probar! 🎉

1. Inicia frontend: `cd frontend && npm start`
2. Ve a http://localhost:4200
3. Click en **"Continue with Google"**
4. Se abre la ventana de Google
5. Selecciona tu cuenta
6. Te redirige y ves tu **nombre y email reales** ✅

## 🎯 Resultado Esperado

Después de configurar correctamente:
- ✅ Se abre ventana de Google al hacer clic
- ✅ Puedes seleccionar tu cuenta
- ✅ Te redirige de vuelta
- ✅ Se muestra tu nombre y email reales
- ❌ NO muestra "Google User" genérico

## 🐛 Troubleshooting

### Error: "Unsupported provider"
**Solución**: Google provider no está habilitado en Supabase
- Ve a Authentication > Providers
- Habilita Google toggle
- Guarda

### Error: "redirect_uri_mismatch"
**Solución**: URLs no coinciden
- Verifica Google Cloud Console redirect URI
- Debe ser exactamente: `https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback`
- No debe tener trailing slash

### No abre ventana de Google
**Solución**: 
- Verifica consola del navegador (F12)
- Verifica que Client ID y Secret estén correctos
- Reinicia el servidor: `npm start`

### Muestra "Google User" genérico
**Solución**:
- Esto es normal si no configuraste OAuth
- Sigue los pasos para configurar OAuth real

## 📝 Notas

- **Desarrollo**: Usa tu email/password para desarrollo
- **Producción**: Configura OAuth para usuarios reales
- **Security**: Nunca expongas Client Secret en el frontend

## 📚 Referencias

- [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)

---

**Estado actual**: ⚠️ Código listo, faltando configuración en Supabase Dashboard

**Para activar**: Sigue los pasos 1-4 arriba, luego descomenta el código en `login.component.ts`
