/**
 * Environment Configuration
 * Development environment settings
 */

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  supabaseUrl: '',
  supabaseKey: '',
  openaiApiKey: '', // Never expose in frontend - use backend proxy
  firebaseConfig: {
    // Add Firebase configuration here if needed
  }
};


