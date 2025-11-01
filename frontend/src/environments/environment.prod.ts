/**
 * Environment Configuration
 * Production environment settings
 * 
 * ⚠️  Este archivo se genera automáticamente desde .env
 * ⚠️  NO editar manualmente - los cambios se perderán
 */

export const environment = {
  production: true,
  
  // API Configuration
  apiUrl: 'https://rubenfitness.onrender.com',
  
  // Supabase Configuration
  supabaseUrl: 'https://nymrsnhnzcagvwwnkyno.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTkzMjc2NiwiZXhwIjoyMDc3NTA4NzY2fQ.ged_tdZwochk2HsYKlrIr2_ZLNERaclBrTvYzrXNrxs',
  
  // OpenAI Configuration (solo para referencia, la API key está en el backend)
  // Nota: La clave de OpenAI NO debe estar en el frontend por seguridad
  openaiApiKey: '',
  
  // Firebase Configuration (opcional)
  firebaseConfig: {}
};
