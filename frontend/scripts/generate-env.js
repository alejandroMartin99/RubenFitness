/**
 * Script para generar archivos environment.ts desde .env
 * Este script lee el archivo .env y genera environment.ts y environment.prod.ts
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');
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
  apiUrl: '${env.API_URL || env.BACKEND_URL || (isProduction ? 'https://rubenfitness.onrender.com' : 'http://localhost:8000')}',
  
  // Supabase Configuration
  supabaseUrl: '${env.SUPABASE_URL || 'https://nymrsnhnzcagvwwnkyno.supabase.co'}',
  supabaseKey: '${env.SUPABASE_ANON_KEY || env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55bXJzbmhuemNhZ3Z3d25reW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzI3NjYsImV4cCI6MjA3NzUwODc2Nn0.bn8GGSHK82KCTsEQIdjpPuTMJ8BcHokdqdCoBS5KCf0'}',
  
  // OpenAI Configuration (solo para referencia, la API key está en el backend)
  // Nota: La clave de OpenAI NO debe estar en el frontend por seguridad
  openaiApiKey: '',
  
  // Firebase Configuration (opcional)
  firebaseConfig: ${env.FIREBASE_CONFIG ? JSON.stringify(JSON.parse(env.FIREBASE_CONFIG)) : '{}'}
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

