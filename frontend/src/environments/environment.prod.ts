/**
 * Environment Configuration
 * Production environment settings
 */

export const environment = {
  production: true,
  apiUrl: 'https://rubenfitness.onrender.com', // TODO: Add your backend production URL (e.g., https://your-app.onrender.com)
  supabaseUrl: 'https://nymrsnhnzcagvwwnkyno.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0',
  openaiApiKey: '', // Never expose in frontend
  firebaseConfig: {
    // Add production Firebase configuration here
  }
};


