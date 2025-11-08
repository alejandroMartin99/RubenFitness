/**
 * Script para generar archivos environment.ts desde .env
 * Este script lee el archivo .env y genera environment.ts y environment.prod.ts
 */

const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, '..', 'src', 'environments');

// Función para leer variables del archivo .env
function loadEnvFile(envFilePath) {
  const env = {};
  
  if (!fs.existsSync(envFilePath)) {
    console.warn(`⚠️  Archivo ${envFilePath} no encontrado. Usando valores por defecto.`);
    return env;
  }
  
  const content = fs.readFileSync(envFilePath, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Ignorar comentarios y líneas vacías
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }
    
    // Parsear KEY=VALUE
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }
    
    const key = trimmedLine.substring(0, equalIndex).trim();
    let value = trimmedLine.substring(equalIndex + 1).trim();
    
    // Remover comillas si existen
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    env[key] = value;
  }
  
  return env;
}

// Función para generar contenido del archivo environment
function generateEnvironmentContent(env, isProduction = false) {
  const getEnvValue = (keys, fallback) => {
    for (const key of keys) {
      if (env[key] !== undefined && env[key] !== '') {
        return env[key];
      }
    }
    return fallback;
  };

  const apiUrl = getEnvValue(
    ['API_URL', 'BACKEND_URL', 'NG_APP_API_URL', 'VITE_API_URL'],
    isProduction ? 'https://rubenfitness.onrender.com' : 'http://localhost:8000'
  );

  const supabaseUrl = getEnvValue(
    ['SUPABASE_URL', 'VITE_SUPABASE_URL', 'NG_APP_SUPABASE_URL'],
    'https://nymrsnhnzcagvwwnkyno.supabase.co'
  );

  const supabaseKey = getEnvValue(
    ['SUPABASE_ANON_KEY', 'SUPABASE_KEY', 'VITE_SUPABASE_ANON_KEY', 'NG_APP_SUPABASE_KEY'],
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0'
  );

  const firebaseConfigRaw = getEnvValue(
    ['FIREBASE_CONFIG', 'VITE_FIREBASE_CONFIG', 'NG_APP_FIREBASE_CONFIG'],
    ''
  );

  let firebaseConfig = '{}';
  if (firebaseConfigRaw) {
    try {
      firebaseConfig = JSON.stringify(JSON.parse(firebaseConfigRaw));
    } catch {
      console.warn('⚠️  FIREBASE_CONFIG no es JSON válido. Usando objeto vacío.');
    }
  }

  return `/**
 * Environment Configuration
 * ${isProduction ? 'Production' : 'Development'} environment settings
 * 
 * ⚠️  Este archivo se genera automáticamente desde .env
 * ⚠️  NO editar manualmente - los cambios se perderán
 */

export const environment = {
  production: ${isProduction},
  
  // API Configuration
  apiUrl: '${apiUrl}',
  
  // Supabase Configuration
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}',
  
  // OpenAI Configuration (solo para referencia, la API key está en el backend)
  // Nota: La clave de OpenAI NO debe estar en el frontend por seguridad
  openaiApiKey: '',
  
  // Firebase Configuration (opcional)
  firebaseConfig: ${firebaseConfig}
};
`;
}

// Función principal
function main() {
  console.log('🔄 Generando archivos environment desde .env...\n');
  
  // Crear directorio si no existe
  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }
  
  // Leer variables de entorno
  let env = {};
  
  // Primero intentar leer desde .env en la raíz del frontend
  const frontendEnvPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(frontendEnvPath)) {
    console.log('📖 Leyendo .env desde frontend/.env...');
    env = loadEnvFile(frontendEnvPath);
  } else {
    // Si no existe, intentar desde la raíz del proyecto
    const rootEnvPath = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(rootEnvPath)) {
      console.log('📖 Leyendo .env desde la raíz del proyecto...');
      env = loadEnvFile(rootEnvPath);
    } else {
      console.log('⚠️  No se encontró archivo .env. Usando valores por defecto.');
    }
  }
  
  // Unir con variables de entorno del proceso (Render/Vercel)
  Object.keys(process.env).forEach((key) => {
    const value = process.env[key];
    if (typeof value === 'string' && value.length) {
      env[key] = value;
    }
  });
  
  // Generar environment.ts (desarrollo)
  const devContent = generateEnvironmentContent(env, false);
  const devPath = path.join(envDir, 'environment.ts');
  fs.writeFileSync(devPath, devContent);
  console.log('✅ Generado: environment.ts');
  
  // Generar environment.prod.ts (producción)
  const prodContent = generateEnvironmentContent(env, true);
  const prodPath = path.join(envDir, 'environment.prod.ts');
  fs.writeFileSync(prodPath, prodContent);
  console.log('✅ Generado: environment.prod.ts');
  
  console.log('\n✨ Archivos environment generados correctamente!');
}

// Ejecutar
main();

