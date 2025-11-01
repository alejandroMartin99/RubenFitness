# ⚙️ Configurar Supabase - PASO CRÍTICO

## 🚨 IMPORTANTE: Desactivar Email Confirmation

Sin este paso, **NO podrás hacer login** después de registrarte.

### Pasos:

1. **Abre tu proyecto Supabase**:  
   https://app.supabase.com/project/nymrsnhnzcagvwwnkyno

2. **Ve a**:  
   Dashboard → **Authentication** → **Providers** → **Email**

3. **Desmarca** el checkbox:  
   ❌ "Confirm email"

4. **Guarda** los cambios

5. **Opcional**: Vuelve a la app y recarga la página

### ¿Qué hace esto?

- Permite que los usuarios inicien sesión inmediatamente después de registrarse
- **Desactivado** = No requiere confirmación por email
- **Activado** = Bloquea el login hasta confirmar el email

---

## ✅ Verificación

Después de desactivar, prueba:

1. Registra un nuevo usuario
2. Haz logout
3. Login con ese usuario

Debería funcionar sin problemas.

---

## 📝 Notas

- En **producción** puedes volver a activar email confirmation
- En **desarrollo** es mejor tenerlo desactivado
- Los usuarios ya registrados NO necesitan re-confirmar

---

**Si ya desactivaste y sigue sin funcionar, revisa que hayas guardado los cambios.**

