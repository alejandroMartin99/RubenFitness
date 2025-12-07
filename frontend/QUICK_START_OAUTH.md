# 🚀 Inicio Rápido: Configurar Google OAuth

## Resumen de 3 Pasos

### 1️⃣ Google Cloud Console (5 minutos)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Ve a **APIs y servicios** → **Credenciales** → **Crear credenciales** → **ID de cliente OAuth 2.0**
4. Tipo: **Aplicación web**
5. **URI de redirección autorizados**:
   ```
   https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback
   http://localhost:4200/auth/callback
   ```
6. **Copia el Client ID y Client Secret**

### 2️⃣ Supabase Dashboard (2 minutos)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Tu proyecto → **Authentication** → **Providers**
3. Habilita **Google**
4. Pega el **Client ID** y **Client Secret** de Google Cloud
5. Haz clic en **Save**

### 3️⃣ Probar (1 minuto)

1. Inicia tu app: `npm start`
2. Ve a `http://localhost:4200/auth/register`
3. Haz clic en **"Sign up with Google"**
4. ¡Debería funcionar! 🎉

---

## 📚 Guía Completa

Para instrucciones detalladas y solución de problemas, ver: **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

---

## ✅ Verificación Rápida

- [ ] Proyecto creado en Google Cloud Console
- [ ] OAuth 2.0 Client ID creado
- [ ] URL de callback configurada en Google Cloud
- [ ] Google provider habilitado en Supabase
- [ ] Client ID y Secret configurados en Supabase
- [ ] Probado el flujo de autenticación

---

## 🐛 Problemas Comunes

**"redirect_uri_mismatch"**
→ Verifica que la URL de callback en Google Cloud sea exactamente:
   `https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback`

**"invalid_client"**
→ Verifica que el Client ID y Secret estén correctos en Supabase

**El botón no hace nada**
→ Limpia la caché del navegador (Ctrl+Shift+R) y reinicia el servidor

