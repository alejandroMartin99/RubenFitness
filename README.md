# Rubén Fitness - AI-Powered Training Platform

A modern fitness application powered by AI, featuring personalized workout plans, progress tracking, and an intelligent fitness assistant.

## 🚀 Features

- **AI-Powered Chat Assistant**: Get personalized fitness advice from Rubén
- **Progress Tracking**: Monitor your workouts and track your fitness journey
- **Smart Workout Plans**: AI-generated workouts based on your goals
- **Dashboard**: Beautiful, intuitive interface for managing your fitness goals
- **Real-time Analytics**: Visualize your progress with charts and statistics

## 📋 Tech Stack

### Frontend
- **Angular 18** (without standalone components)
- **TypeScript** with strict typing
- **SCSS** for styling with CSS variables
- **Tailwind CSS** for utility classes
- **Angular Material** for UI components
- **Chart.js** for data visualization

### Backend
- **FastAPI** (Python)
- **Pydantic** for data validation
- **Supabase** for database and authentication
- **OpenAI** for AI chat functionality
- **Firebase Cloud Messaging** for notifications

## 📁 Project Structure

```
RubenFitness/
├── frontend/          # Angular 18 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Services, guards, models
│   │   │   ├── features/       # Feature modules (auth, dashboard, etc.)
│   │   │   └── app.module.ts
│   │   ├── assets/
│   │   └── styles/
│   └── package.json
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Configuration
│   │   ├── models/   # Pydantic schemas
│   │   └── services/ # Business logic
│   └── requirements.txt
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Supabase** account (free tier)
- **OpenAI** API key (optional for development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
copy .env.example .env
```

Edit `.env` and add your credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

5. Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update environment configuration (optional):
Edit `src/environments/environment.ts` and add your API URL if different from default.

4. Run the development server:
```bash
npm start
# or
ng serve
```

Frontend will be available at `http://localhost:4200`

## 🎨 Customizing the Color Palette

The application uses CSS variables for easy theming. To customize colors:

1. Open `frontend/src/styles/variables.scss`
2. Modify the color values under `:root`
3. Save and refresh the application

Example:
```scss
:root {
  --color-primary: #3b82f6;    /* Change to your brand color */
  --color-accent: #06b6d4;     /* Change accent color */
  /* ... */
}
```

## 📱 Features Documentation

### Authentication
- Mock authentication (easily replaceable with Supabase Auth)
- Protected routes with AuthGuard
- User session management

### Chat Assistant
- AI-powered fitness advice
- Conversation history
- Context-aware responses

### Progress Tracking
- Workout completion tracking
- Progress statistics
- Streak counting

### Dashboard
- Overview of user activities
- Quick access to features
- User profile information

## 🔧 API Endpoints

### Chat
- `POST /api/v1/chat` - Send message to AI assistant
- `GET /api/v1/chat/history/{user_id}` - Get chat history

### Progress
- `POST /api/v1/progress` - Record workout progress
- `GET /api/v1/progress/{user_id}` - Get progress summary
- `GET /api/v1/progress/{user_id}/stats` - Get detailed statistics

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check

API documentation available at `http://localhost:8000/docs` (Swagger UI)

## 🗄️ Database Schema (Supabase)

### Tables Required

1. **users**
   - id (uuid, PK)
   - email (text, unique)
   - full_name (text)
   - age (integer)
   - fitness_level (text)
   - created_at (timestamp)

2. **chat_messages**
   - id (uuid, PK)
   - user_id (uuid, FK)
   - role (text)
   - content (text)
   - timestamp (timestamp)

3. **progress**
   - id (uuid, PK)
   - user_id (uuid, FK)
   - workout_id (text)
   - date (timestamp)
   - notes (text)

## 🚢 Deployment Instructions

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. From frontend directory:
```bash
vercel
```

3. Update environment variables in Vercel dashboard

### Backend (Railway / Render)

1. Create account on Railway or Render
2. Connect your GitHub repository
3. Set environment variables in platform dashboard
4. Deploy

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL scripts to create tables (see `backend/README.md`)
3. Copy your project URL and anon key
4. Add to backend `.env` file

### Firebase (Notifications)

1. Create a Firebase project
2. Download service account JSON
3. Add path to `FIREBASE_CREDENTIALS_PATH` in `.env`
4. Configure Cloud Messaging

## 📝 Development Notes

- The app runs in mock mode if Supabase/OpenAI credentials are not configured
- CORS is configured to allow frontend requests
- All API endpoints return JSON responses
- Error handling is implemented throughout

## ✅ Completed Features (Hito 1 & 2)

- [x] Project structure and setup
- [x] Authentication system with guards
- [x] AI chat assistant integration
- [x] Progress tracking functionality
- [x] Dashboard with navigation
- [x] Lazy-loaded feature modules
- [x] Responsive design
- [x] Mock data support for development
- [x] API documentation with Swagger

## 🚧 Pending Features

- [ ] Production Supabase integration
- [ ] Firebase Cloud Messaging setup
- [ ] Advanced coach panel
- [ ] Community features
- [ ] Workout photo uploads
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Premium subscription features

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Verify Python version is 3.10+
- Ensure virtual environment is activated

### Frontend build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### CORS errors
- Verify backend is running on port 8000
- Check CORS configuration in `backend/app/core/config.py`

## 📄 License

This project is part of the Rubén Fitness platform development.

## 🤝 Contributing

This is a private project. For issues or questions, please contact the development team.

---

**Built with ❤️ for fitness enthusiasts**


