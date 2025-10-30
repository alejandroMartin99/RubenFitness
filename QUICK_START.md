# ⚡ Quick Start - Rubén Fitness

## 🎯 Setup Rápido Local

```bash
# 1. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 2. Frontend (en otra terminal)
cd frontend
npm install
npm start
```

👉 Abre: http://localhost:4200

---

## 🚀 Deploy en Vercel (30 segundos)

### Opción A: Dashboard (Recomendado)
1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Conecta tu repositorio de GitHub
3. **Root Directory**: `frontend` ⚠️ **IMPORTANTE**
4. Click **Deploy**

### Opción B: CLI
```bash
cd frontend
vercel login
vercel
```

---

## 📚 Documentación Completa

- **Local**: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **Vercel**: [VERCEL_SETUP.md](VERCEL_SETUP.md)
- **Backend**: [DEPLOYMENT_INSTRUCTIONS.md](DEPLOYMENT_INSTRUCTIONS.md)
- **General**: [README.md](README.md)

---

## ⚠️ Problema Común: Vercel da error

**Solución**: Configura **Root Directory** como `frontend` en Vercel Dashboard

Ver: [VERCEL_SETUP.md](VERCEL_SETUP.md) ← Paso a paso detallado

---

✅ **¡Listo para desarrollar!**

