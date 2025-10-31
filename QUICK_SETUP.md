# 🚀 Quick Setup - Rubén Fitness

## ⚡ Inicio Rápido en 5 Minutos

### 1️⃣ Backend Local

```bash
cd backend

# Crear entorno virtual
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env y agrega tus credenciales

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

✅ Backend corriendo en: http://localhost:8000

---

### 2️⃣ Frontend Local

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

✅ Frontend corriendo en: http://localhost:4200

---

## 🔧 Configuración de Supabase (1 vez)

### Opción A: Con Supabase Real

1. Ve a [supabase.com](https://supabase.com) y crea cuenta
2. Crea nuevo proyecto
3. Obtén `SUPABASE_URL` y `SUPABASE_KEY`
4. Ve a **SQL Editor** y ejecuta `backend/supabase_schema.sql`
5. Agrega credenciales a `backend/.env` y `frontend/src/environments/environment.ts`

Ver: [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para guía detallada

### Opción B: Modo Desarrollo (sin Supabase)

Por ahora, la app funciona con **mocks** para desarrollo:

- Login con: `admin@ruben.fitness` / `admin` o `tester@ruben.fitness` / `tester`
- Los datos se guardan en localStorage
- No necesitas Supabase para probar localmente

---

## 📦 Variables de Entorno Mínimas

### Backend `.env`

```env
SUPABASE_URL=
SUPABASE_KEY=
OPENAI_API_KEY=
CORS_ORIGINS=http://localhost:4200
```

### Frontend `environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  supabaseUrl: '',
  supabaseKey: '',
  openaiApiKey: '',
  firebaseConfig: {}
};
```

---

## ✅ Verificar que Funciona

1. Abre http://localhost:4200
2. Click en **Register** o **Login**
3. Usa credenciales de prueba:
   - Email: `tester@ruben.fitness`
   - Password: `tester`
4. Deberías ver el dashboard

---

## 🎯 Próximos Pasos

- [ ] Configurar Supabase real
- [ ] Agregar OpenAI API key
- [ ] Configurar Firebase (opcional)
- [ ] Deploy a producción

---

## 🐛 Problemas Comunes

### Backend no inicia
- Verifica que Python 3.10+ está instalado
- Asegúrate de que el entorno virtual está activado
- Revisa que el puerto 8000 esté libre

### Frontend no inicia
- Verifica Node.js 18+ está instalado
- Borra `node_modules` y reinstala: `rm -rf node_modules && npm install`
- Revisa que el puerto 4200 esté libre

### CORS errors
- Verifica que `CORS_ORIGINS` en backend incluye `http://localhost:4200`
- Asegúrate de que ambos servidores estén corriendo

---

## 📚 Documentación Completa

- **Setup Detallado**: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **Supabase**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **Deploy**: [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md)
- **General**: [README.md](README.md)

---

🎉 **¡Listo para desarrollar!**

