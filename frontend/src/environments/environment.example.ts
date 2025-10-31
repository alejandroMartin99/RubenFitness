/**
 * Environment Configuration - Example
 * Copy this file to environment.ts and environment.prod.ts with your actual values
 */

export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:8000',
  
  // Supabase Configuration
  supabaseUrl: 'https://your-project-id.supabase.co',
  supabaseKey: 'your-anon-or-public-key-here',
  
  // OpenAI Configuration (optional - frontend might not need this)
  openaiApiKey: '',
  
  // Firebase Configuration (for push notifications)
  firebaseConfig: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id'
  }
};

