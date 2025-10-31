# 🔧 Configuración de Supabase - Rubén Fitness

## 📋 Guía Paso a Paso

### 1️⃣ Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Click en **"New Project"**
3. Llena los datos:
   - **Name**: Ruben Fitness (o el que prefieras)
   - **Database Password**: Genera una contraseña segura (¡Guárdala!)
   - **Region**: Elige la más cercana (EU, US, etc.)
4. Click **"Create new project"**
5. Espera 2-3 minutos a que se cree el proyecto

---

### 2️⃣ Obtener Credenciales

1. Ve a **Settings** → **API** en tu proyecto
2. Copia estos valores:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → Para el frontend
   - **service_role key** → Para el backend (⚠️ SECRETO!)

---

### 3️⃣ Crear Esquema de Base de Datos

1. Ve a **SQL Editor** en el menú lateral
2. Click **"New query"**
3. Copia y pega todo el contenido de `backend/supabase_schema.sql`
4. Click **"Run"** o presiona `Ctrl+Enter`
5. Verifica que no haya errores (deberías ver "Success. No rows returned")

---

### 4️⃣ Configurar Variables de Entorno

#### Backend (`.env`)

```bash
cd backend
cp .env.example .env
```

Edita `.env` y agrega tus valores:

```env
SUPABASE_URL=https://nymrsnhnzcagvwwnkyno.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0
OPENAI_API_KEY=tu-openai-key-aqui
CORS_ORIGINS=http://localhost:4200
```

#### Frontend (`environment.ts`)

Edita `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  supabaseUrl: 'https://nymrsnhnzcagvwwnkyno.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0',
  openaiApiKey: '',
  firebaseConfig: { /* opcional */ }
};
```

---

### 5️⃣ Configurar Autenticación

1. Ve a **Authentication** → **Providers** en Supabase
2. Habilita los providers que necesites:
   - ✅ **Email** (enabled by default)
   - ✅ **Google** (opcional - para OAuth)
   - ✅ **Apple** (opcional - para OAuth)
3. Configura las URLs de redirect:
   - Development: `http://localhost:4200`
   - Production: `https://tu-app.vercel.app`

---

### 6️⃣ Configurar Storage (Opcional)

Para subir fotos de progreso y avatares:

1. Ve a **Storage** en el menú lateral
2. Crea buckets:
   - `workout-photos` (público)
   - `user-profiles` (privado)
3. Configura políticas RLS según tus necesidades

---

### 7️⃣ Verificar Instalación

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# o
.venv\Scripts\activate      # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Abre: http://localhost:8000/docs

#### Frontend

```bash
cd frontend
npm install
npm start
```

Abre: http://localhost:4200

---

### 8️⃣ Crear Usuario de Prueba

#### Opción A: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Llena email y password
4. Guarda el User ID generado

#### Opción B: Desde tu App

1. Abre http://localhost:4200
2. Ve a **Register**
3. Crea una cuenta
4. Verifica en Supabase Dashboard que aparezca en **Authentication** → **Users**

#### Crear Usuario Admin

1. En Supabase SQL Editor, ejecuta:

```sql
-- Reemplaza 'USER_ID_AQUI' con el ID real del usuario
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'USER_ID_AQUI';
```

---

### 9️⃣ Verificar Tablas

En Supabase Dashboard, ve a **Table Editor** y deberías ver:
- ✅ users
- ✅ workouts
- ✅ exercises
- ✅ progress
- ✅ chat_messages
- ✅ habits
- ✅ habit_logs
- ✅ coach_clients

---

### 🔟 Testing de Conexión

#### Prueba desde Backend

```bash
# En terminal, desde la carpeta backend
python
```

```python
from app.services.supabase_service import supabase_service
print("Connected:", supabase_service.is_connected())
```

Si imprime `True`, ¡todo está conectado correctamente!

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Verifica que copiaste la key correcta
- Backend usa `service_role` key
- Frontend usa `anon` key

### Error: "relation does not exist"
- El esquema SQL no se ejecutó correctamente
- Vuelve a ejecutar `supabase_schema.sql` en SQL Editor

### Error: CORS
- Agrega tu frontend URL a `CORS_ORIGINS` en backend `.env`
- Verifica en Supabase que las URLs de redirect estén configuradas

### Error: RLS blocking queries
- Verifica las políticas en el dashboard
- Asegúrate de que el usuario esté autenticado

---

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Supabase
- [ ] Credenciales copiadas
- [ ] Esquema SQL ejecutado exitosamente
- [ ] Variables de entorno configuradas
- [ ] Autenticación configurada
- [ ] Usuario de prueba creado
- [ ] Backend conectado a Supabase
- [ ] Frontend conectado a Supabase
- [ ] Storage configurado (opcional)
- [ ] Todo funcionando localmente

---

## 📚 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase Python Client](https://github.com/supabase/supabase-py)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

🎉 **¡Listo!** Ahora tu aplicación está conectada a Supabase.

