# 🔧 Configurar Google OAuth en Supabase - Guía Rápida

## ❌ Error que estás viendo:
```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

Este error significa que **Google OAuth no está habilitado** en tu proyecto de Supabase.

---

## ✅ Solución: Habilitar Google en Supabase

### Paso 1: Ir a Supabase Dashboard

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **nymrsnhnzcagvwwnkyno**

### Paso 2: Habilitar Google Provider

1. En el menú lateral izquierdo, haz clic en **"Authentication"**
2. Haz clic en **"Providers"** (o "Proveedores")
3. Busca **"Google"** en la lista de proveedores
4. **Haz clic en el toggle** para habilitarlo (debe estar en verde/activado)

### Paso 3: Configurar Credenciales (si aún no lo has hecho)

Si el toggle está activado pero aún ves el error, necesitas configurar las credenciales:

#### Opción A: Configuración Rápida (Solo para pruebas)

1. En la sección de Google, haz clic en **"Configure"** o el botón de configuración
2. Verás dos campos:
   - **Client ID (for Google OAuth)**
   - **Client Secret (for Google OAuth)**

#### Opción B: Obtener Credenciales de Google Cloud (Recomendado)

Si aún no tienes credenciales de Google, sigue estos pasos:

**1. Crear proyecto en Google Cloud:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente

**2. Habilitar Google+ API:**
   - Ve a **APIs y servicios** → **Biblioteca**
   - Busca "Google+ API" y habilítala

**3. Configurar Pantalla de Consentimiento:**
   - Ve a **APIs y servicios** → **Pantalla de consentimiento OAuth**
   - Selecciona "Externo" y completa la información básica
   - Guarda y continúa

**4. Crear Credenciales OAuth 2.0:**
   - Ve a **APIs y servicios** → **Credenciales**
   - Haz clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth 2.0"**
   - Tipo: **Aplicación web**
   - **Nombre**: Rubén Fitness
   - **URI de redirección autorizados**:
     ```
     https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback
     http://localhost:4200/auth/callback
     ```
   - Haz clic en **"Crear"**
   - **Copia el Client ID y Client Secret**

**5. Pegar en Supabase:**
   - Vuelve a Supabase Dashboard
   - Pega el **Client ID** en el campo correspondiente
   - Pega el **Client Secret** en el campo correspondiente
   - Haz clic en **"Save"** o **"Guardar"**

### Paso 4: Verificar URLs de Redirección

1. En la misma página de Providers, busca la sección **"Redirect URLs"** o **"Site URL"**
2. Asegúrate de que estas URLs estén configuradas:
   ```
   http://localhost:4200
   http://localhost:4200/auth/callback
   ```
3. Si no están, agrégalas y guarda

---

## 🧪 Probar la Configuración

1. **Reinicia tu servidor de desarrollo** (si está corriendo):
   ```powershell
   # Detén con Ctrl+C, luego:
   npm start
   ```

2. **Limpia la caché del navegador**:
   - Presiona `Ctrl+Shift+R` (hard refresh)
   - O abre en modo incógnito

3. **Ve a la página de registro**:
   ```
   http://localhost:4200/auth/register
   ```

4. **Haz clic en "Sign up with Google"**

5. **Deberías ser redirigido a Google** para autenticarte

---

## 🔍 Verificación Rápida

Verifica que:

- [ ] Google está **habilitado** (toggle en verde) en Supabase
- [ ] **Client ID** está configurado (no vacío)
- [ ] **Client Secret** está configurado (no vacío)
- [ ] **Redirect URLs** incluyen `http://localhost:4200/auth/callback`
- [ ] Has guardado los cambios en Supabase

---

## 🐛 Si el Error Persiste

### Error: "redirect_uri_mismatch"

**Solución**: Verifica que en Google Cloud Console, la URI de redirección sea exactamente:
```
https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback
```

### Error: "invalid_client"

**Solución**: 
- Verifica que el Client ID y Secret sean correctos
- Asegúrate de no tener espacios extra al copiar/pegar
- Vuelve a copiar desde Google Cloud Console

### El botón no hace nada

**Solución**:
1. Abre la consola del navegador (F12)
2. Verifica si hay errores de JavaScript
3. Limpia la caché del navegador
4. Reinicia el servidor de desarrollo

---

## 📝 Notas Importantes

1. **Para desarrollo local**: Usa `http://localhost:4200`
2. **Para producción**: Necesitarás agregar tu dominio de producción
3. **Client Secret**: Mantén esto seguro, nunca lo compartas públicamente
4. **Primera vez**: Google puede pedirte autorizar la aplicación

---

## 🎯 Resumen de Pasos Críticos

1. ✅ **Supabase Dashboard** → Authentication → Providers
2. ✅ **Habilitar Google** (toggle activado)
3. ✅ **Configurar Client ID y Secret** (de Google Cloud Console)
4. ✅ **Verificar Redirect URLs**
5. ✅ **Guardar cambios**
6. ✅ **Probar en la aplicación**

---

¿Necesitas ayuda con algún paso específico? Revisa también `GOOGLE_OAUTH_SETUP.md` para una guía más detallada.

