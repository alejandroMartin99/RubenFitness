# 🔐 Configuración de Google OAuth en Supabase

Esta guía te ayudará a configurar Google OAuth para que funcione con tu aplicación Rubén Fitness.

## 📋 Requisitos Previos

- Tener un proyecto en Supabase
- Tener acceso a Google Cloud Console
- Tener la URL de tu aplicación (ej: `http://localhost:4200` para desarrollo)

---

## 🚀 Paso 1: Configurar Google Cloud Console

### 1.1. Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos (arriba a la izquierda)
3. Haz clic en **"Nuevo Proyecto"**
4. Ingresa un nombre (ej: "Rubén Fitness OAuth")
5. Haz clic en **"Crear"**

### 1.2. Habilitar Google+ API

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google+ API"**
3. Haz clic en **"Habilitar"**

### 1.3. Configurar Pantalla de Consentimiento OAuth

1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** (o "Interno" si tienes Google Workspace)
3. Haz clic en **"Crear"**
4. Completa la información:
   - **Nombre de la aplicación**: Rubén Fitness
   - **Correo electrónico de soporte**: tu email
   - **Dominio autorizado**: (déjalo vacío por ahora)
   - **Correo electrónico del desarrollador**: tu email
5. Haz clic en **"Guardar y continuar"**
6. En **"Scopes"**, haz clic en **"Guardar y continuar"** (usa los scopes predeterminados)
7. En **"Usuarios de prueba"**, agrega tu email si es necesario
8. Haz clic en **"Volver al panel"**

### 1.4. Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth 2.0"**
3. Selecciona **"Aplicación web"**
4. Configura:
   - **Nombre**: Rubén Fitness Web Client
   - **Orígenes autorizados de JavaScript**:
     ```
     http://localhost:4200
     https://tu-dominio.com
     ```
   - **URI de redirección autorizados**:
     ```
     https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback
     http://localhost:4200/auth/callback
     ```
5. Haz clic en **"Crear"**
6. **IMPORTANTE**: Copia el **Client ID** y **Client Secret** (los necesitarás en el siguiente paso)

---

## 🔧 Paso 2: Configurar Supabase

### 2.1. Acceder a la Configuración de Autenticación

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, ve a **"Authentication"**
3. Haz clic en **"Providers"**

### 2.2. Configurar Google Provider

1. Busca **"Google"** en la lista de proveedores
2. Haz clic en el toggle para **habilitar Google**
3. Ingresa la información:
   - **Client ID (for Google OAuth)**: Pega el Client ID que copiaste de Google Cloud
   - **Client Secret (for Google OAuth)**: Pega el Client Secret que copiaste de Google Cloud
4. Haz clic en **"Save"**

### 2.3. Configurar URL de Redirección

1. En la misma página de Providers, busca la sección **"Redirect URLs"**
2. Asegúrate de que estas URLs estén configuradas:
   ```
   http://localhost:4200/auth/callback
   https://tu-dominio.com/auth/callback
   ```
3. Si no están, agrégalas y haz clic en **"Save"**

---

## ✅ Paso 3: Verificar la Configuración

### 3.1. Verificar en el Código

El código ya está configurado correctamente:

- ✅ `supabase.service.ts` tiene `signInWithGoogle()` configurado
- ✅ `auth.service.ts` tiene `loginWithGoogle()` implementado
- ✅ `register.component.ts` y `login.component.ts` tienen los botones de Google
- ✅ `auth-callback.component.ts` maneja el callback de OAuth

### 3.2. Probar la Integración

1. Inicia tu servidor de desarrollo:
   ```powershell
   npm start
   ```

2. Ve a `http://localhost:4200/auth/register` o `/auth/login`

3. Haz clic en **"Sign up with Google"** o **"Continue with Google"**

4. Deberías ser redirigido a Google para autenticarte

5. Después de autenticarte, serás redirigido de vuelta a `/auth/callback`

6. Si es un usuario nuevo, serás redirigido a `/auth/profile-setup`

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirección en Google Cloud Console no coincide con la de Supabase.

**Solución**:
1. Verifica que en Google Cloud Console tengas:
   ```
   https://nymrsnhnzcagvwwnkyno.supabase.co/auth/v1/callback
   ```
2. Verifica que en Supabase tengas configurada la URL de tu app:
   ```
   http://localhost:4200/auth/callback
   ```

### Error: "invalid_client"

**Causa**: El Client ID o Client Secret son incorrectos.

**Solución**:
1. Verifica que hayas copiado correctamente el Client ID y Client Secret
2. Asegúrate de que no haya espacios extra al copiar/pegar
3. Vuelve a copiar desde Google Cloud Console

### Error: "access_denied"

**Causa**: El usuario canceló la autorización o hay un problema con los scopes.

**Solución**:
1. Verifica que la Pantalla de Consentimiento OAuth esté configurada correctamente
2. Asegúrate de que tu email esté en "Usuarios de prueba" si la app está en modo de prueba

### El botón de Google no hace nada

**Causa**: Puede ser caché del navegador o el código no se ha recargado.

**Solución**:
1. Limpia la caché del navegador (Ctrl+Shift+Delete)
2. Haz un hard refresh (Ctrl+Shift+R)
3. Verifica en la consola del navegador (F12) si hay errores
4. Reinicia el servidor de desarrollo

---

## 📝 Notas Importantes

1. **URLs de Producción**: Cuando despliegues a producción, asegúrate de:
   - Agregar tu dominio de producción en Google Cloud Console
   - Agregar la URL de callback de producción en Supabase
   - Actualizar `redirectTo` en `supabase.service.ts` si es necesario

2. **Seguridad**: 
   - Nunca compartas tu Client Secret públicamente
   - Mantén las credenciales seguras
   - Usa variables de entorno en producción si es posible

3. **Límites de Google OAuth**:
   - En modo de prueba, solo los usuarios agregados pueden autenticarse
   - Para producción, necesitas verificar tu aplicación con Google

---

## 🎉 ¡Listo!

Una vez completados estos pasos, Google OAuth debería funcionar correctamente. Si encuentras algún problema, revisa la sección de "Solución de Problemas" o verifica los logs en:
- Consola del navegador (F12)
- Supabase Dashboard → Logs
- Google Cloud Console → Logs

