# Configuración de Variables de Entorno

Este proyecto utiliza un sistema automatizado para cargar variables de entorno desde el archivo `.env` ubicado en la raíz del proyecto.

## ✅ Verificación de la API Key de OpenAI

Para verificar que la API key de OpenAI funciona correctamente, ejecuta:

```bash
cd backend
python test_openai.py
```

Este script:
- ✅ Verifica que la API key está configurada
- ✅ Prueba la conexión con OpenAI
- ✅ Realiza una prueba de chat real

## 📝 Variables de Entorno

El archivo `.env` debe estar en la raíz del proyecto (`/RubenFitness/.env`).

### Variables para Backend

```env
# OpenAI Configuration
OPENAI_API_KEY=tu_clave_de_api_aqui

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_service_role_key_aqui

# Application
APP_NAME=Ruben Fitness API
DEBUG=False
ENVIRONMENT=development
```

### Variables para Frontend (opcionales)

Si quieres personalizar el frontend, puedes agregar estas variables al `.env`:

```env
# API Backend URL (para desarrollo)
API_URL=http://localhost:8000

# Supabase Anon Key (diferente de SUPABASE_KEY del backend)
# El frontend usa la "anon key", el backend usa la "service_role key"
SUPABASE_ANON_KEY=tu_anon_key_aqui
```

**Nota importante:** 
- El frontend usa automáticamente `SUPABASE_ANON_KEY` si está disponible, o `SUPABASE_KEY` como fallback.
- La clave de OpenAI **NO** debe estar en el frontend por seguridad. Solo se usa en el backend.

## 🔄 Generación Automática de Archivos Environment

Los archivos `environment.ts` y `environment.prod.ts` se generan automáticamente desde el `.env`:

- ✅ Se generan automáticamente antes de `npm start`
- ✅ Se generan automáticamente antes de `npm run build`
- ✅ También puedes ejecutar manualmente: `npm run generate-env`

**⚠️ No edites manualmente** `environment.ts` o `environment.prod.ts` - los cambios se perderán.

## 📂 Estructura

```
RubenFitness/
├── .env                    # Archivo principal de variables de entorno (raíz)
├── backend/
│   ├── app/
│   │   └── core/
│   │       └── config.py   # Lee .env desde la raíz (../env)
│   └── test_openai.py      # Script de prueba de OpenAI
└── frontend/
    ├── scripts/
    │   └── generate-env.js # Script que genera environment.ts desde .env
    └── src/
        └── environments/
            ├── environment.ts        # Generado automáticamente
            └── environment.prod.ts  # Generado automáticamente
```

## 🔍 Servicios que Usan Variables de Entorno

### Backend
- `app/core/config.py` - Configuración centralizada
- `app/services/openai_service.py` - Usa `OPENAI_API_KEY`
- `app/services/supabase_service.py` - Usa `SUPABASE_URL` y `SUPABASE_KEY`

### Frontend
- `app/core/services/api.service.ts` - Usa `environment.apiUrl`
- `app/core/services/supabase.service.ts` - Usa `environment.supabaseUrl` y `environment.supabaseKey`

Todos los servicios del frontend obtienen sus valores desde `environment.ts`, que se genera desde el `.env`.

