# Rubén Fitness Backend API

FastAPI backend for the Rubén Fitness AI-powered training platform.

## Features

- **AI Chat Assistant**: OpenAI-powered chat for fitness guidance
- **Progress Tracking**: Workout progress and statistics tracking
- **Supabase Integration**: Database and authentication
- **REST API**: RESTful endpoints for all features

## Installation

### 1. Create Virtual Environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and fill in your API keys:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: Your OpenAI API key

### 4. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check

### Chat
- `POST /api/v1/chat` - Send message to AI assistant
- `GET /api/v1/chat/history/{user_id}` - Get chat history

### Progress
- `POST /api/v1/progress` - Record workout progress
- `GET /api/v1/progress/{user_id}` - Get user progress summary
- `GET /api/v1/progress/{user_id}/stats` - Get detailed statistics

## Database Schema (Supabase)

### Tables

1. **users**
   - `id` (uuid, primary key)
   - `email` (text, unique)
   - `full_name` (text)
   - `age` (int)
   - `fitness_level` (text)
   - `created_at` (timestamp)

2. **chat_messages**
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key)
   - `role` (text) - 'user' or 'assistant'
   - `content` (text)
   - `timestamp` (timestamp)

3. **progress**
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key)
   - `workout_id` (text)
   - `date` (timestamp)
   - `notes` (text)

## Development Notes

- The API works in mock mode if Supabase/OpenAI credentials are not configured
- CORS is configured to allow requests from `localhost:4200` (Angular dev server)
- All endpoints return JSON responses
- Error handling is implemented for all endpoints

## Testing

You can test the API using the Swagger UI or tools like Postman/Insomnia.

Example request to chat endpoint:

```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "message": "I want to start working out"
  }'
```


