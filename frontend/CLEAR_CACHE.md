# Limpiar Caché y Reiniciar

Si ves mensajes antiguos como "Google Sign Up will be available after configuring OAuth", sigue estos pasos:

## Pasos para limpiar la caché:

1. **Detén el servidor de desarrollo** (Ctrl+C en la terminal)

2. **Limpia la caché de Angular:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .angular -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
   ```

3. **Limpia la caché del navegador:**
   - Chrome/Edge: Ctrl+Shift+Delete → Selecciona "Cached images and files" → Clear data
   - O usa modo incógnito para probar

4. **Reinicia el servidor:**
   ```powershell
   npm start
   ```

5. **Si el problema persiste, haz un hard refresh:**
   - Chrome/Edge: Ctrl+Shift+R o Ctrl+F5
   - Firefox: Ctrl+Shift+R
   - Safari: Cmd+Shift+R

## Verificar que el código está actualizado:

El código actual en `register.component.ts` ya tiene la implementación correcta:
- ✅ `onGoogleSignUp()` llama a `authService.loginWithGoogle()`
- ✅ No hay mensajes de alerta sobre configuración de OAuth
- ✅ El método `loginWithGoogle()` en `AuthService` usa `supabaseService.signInWithGoogle()`
- ✅ El `SupabaseService` tiene el método `signInWithGoogle()` implementado correctamente

## Estado actual del código:

**✅ Implementación correcta:**
- `register.component.ts` línea 33-47: `onGoogleSignUp()` implementado
- `login.component.ts` línea 31-45: `onGoogleSignIn()` implementado  
- `auth.service.ts` línea 289-291: `loginWithGoogle()` implementado
- `supabase.service.ts` línea 62-70: `signInWithGoogle()` implementado

Si después de limpiar la caché sigues viendo el mensaje antiguo, verifica que:
1. El servidor de desarrollo se haya reiniciado completamente
2. No haya archivos `.js` antiguos en `dist/`
3. El navegador no esté usando Service Workers (desactívalos en DevTools → Application → Service Workers)
4. Verifica en la consola del navegador (F12) que no haya errores de JavaScript

## Nota sobre Google OAuth:

Para que Google OAuth funcione completamente, necesitas configurarlo en Supabase:
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Authentication → Providers → Google
3. Habilita Google y configura Client ID y Client Secret
4. Agrega la URL de callback: `https://[tu-proyecto].supabase.co/auth/v1/callback`

