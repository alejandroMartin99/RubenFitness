# 🔗 Conectar Supabase - Guía Paso a Paso

## ✅ Paso 1: Obtener Credenciales de Supabase

1. Ve a tu proyecto en [app.supabase.com](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** (ejemplo: `https://xyzabc.supabase.co`)
   - **service_role** key (para backend - NO la anon key!)
   - **anon/public** key (para frontend)

---

## ✅ Paso 2: Ejecutar Schema SQL

1. En Supabase, ve a **SQL Editor**
2. Click **"New query"**
3. Copia TODO el contenido de `backend/supabase_schema.sql`
4. Pega en el editor y click **"Run"**
5. Verifica que dice "Success" sin errores

---

## ✅ Paso 3: Configurar Backend

Crea archivo `backend/.env`:

```env
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_KEY=TU_SERVICE_ROLE_KEY
OPENAI_API_KEY=sk-tu_openai_key_aqui
CORS_ORIGINS=http://localhost:4200
APP_NAME=Rubén Fitness API
DEBUG=False
```

**⚠️ IMPORTANTE**: Usa la `service_role` key en el backend, NO la anon key.

---

## ✅ Paso 4: Configurar Frontend

Edita `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  supabaseUrl: 'https://TU_PROYECTO.supabase.co',
  supabaseKey: 'TU_ANON_PUBLIC_KEY',
  openaiApiKey: '',
  firebaseConfig: {}
};
```

---

## ✅ Paso 5: Probar Conexión

### Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Abre: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm start
```

Abre: http://localhost:4200

---

## ✅ Paso 6: Crear Usuario de Prueba

### Opción A: Desde la App

1. Abre http://localhost:4200
2. Ve a **Register**
3. Crea una cuenta
4. Verifica en Supabase Dashboard → **Authentication** → **Users** que aparezca

### Opción B: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Email: `test@example.com`
4. Password: `test123456`
5. Guarda el **User ID** generado

### Opción C: Crear Admin desde SQL

Después de crear un usuario, ejecuta en SQL Editor:

```sql
-- Reemplaza 'USER_ID_AQUI' con el ID real del usuario
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'USER_ID_AQUI';
```

---

## ✅ Paso 7: Verificar que Todo Funciona

1. **Login** desde frontend: http://localhost:4200
2. Deberías ver el dashboard
3. Intenta hacer un chat (se guardará en Supabase)
4. Ve a Supabase → **Table Editor** → **chat_messages** y verifica que haya mensajes

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Verifica que copiaste correctamente las keys
- Backend usa `service_role`, Frontend usa `anon`

### Error: "relation does not exist"
- El schema no se ejecutó correctamente
- Vuelve a ejecutar `supabase_schema.sql`

### Error: CORS
- Verifica que `CORS_ORIGINS` incluye `http://localhost:4200`
- Reinicia el backend

### No aparecen datos en Supabase
- Verifica que RLS esté configurado correctamente
- Revisa las políticas en SQL Editor

---

## ✅ Checklist Final

- [ ] Credenciales de Supabase copiadas
- [ ] Schema SQL ejecutado sin errores
- [ ] `.env` en backend configurado
- [ ] `environment.ts` en frontend configurado
- [ ] Backend corriendo y respondiendo
- [ ] Frontend conectado al backend
- [ ] Usuario de prueba creado
- [ ] Login funciona
- [ ] Datos se guardan en Supabase

---

🎉 **¡Conectado!** Ya puedes usar la app con Supabase real.

