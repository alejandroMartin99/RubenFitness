# 📋 Tus Credenciales de Supabase

## ✅ Ya tienes:

**URL del Proyecto**: `https://nymrsnhnzcagvwwnkyno.supabase.co`

**Anon Key (Frontend)**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0
```

## ⚠️ Necesitas Obtener la Service Role Key

Para el **backend** necesitas la `service_role` key (diferente de la anon):

1. Ve a: https://app.supabase.com/project/nymrsnhnzcagvwwnkyno/settings/api
2. Busca la sección **"Project API keys"**
3. Busca la key con **role: service_role** (está oculta)
4. Click en el icono del ojo 👁️ para revelarla
5. Copia la `service_role` key

---

## 🚀 Configuración Rápida

Una vez que tengas la service_role key:

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://nymrsnhnzcagvwwnkyno.supabase.co
SUPABASE_KEY=TU_SERVICE_ROLE_KEY_AQUI
OPENAI_API_KEY=
CORS_ORIGINS=http://localhost:4200
APP_NAME=Rubén Fitness API
DEBUG=False
```

**Frontend** (`frontend/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  supabaseUrl: 'https://nymrsnhnzcagvwwnkyno.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0',
  openaiApiKey: '',
  firebaseConfig: {}
};
```

---

## 📝 Siguiente Paso

Lee: **[CONNECT_SUPABASE.md](CONNECT_SUPABASE.md)** para configurar todo paso a paso.

