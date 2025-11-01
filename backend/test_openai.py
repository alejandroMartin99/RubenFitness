"""
Script de prueba para verificar que la API key de OpenAI funciona correctamente
"""

import sys
import os
from pathlib import Path

# Añadir el directorio backend al path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.openai_service import openai_service
from app.core.config import settings

def test_openai_connection():
    """Prueba la conexión con OpenAI"""
    print("=" * 60)
    print("Test de conexión con OpenAI")
    print("=" * 60)
    
    # Verificar que la API key está configurada
    if not settings.OPENAI_API_KEY:
        print("❌ ERROR: OPENAI_API_KEY no está configurada en .env")
        print(f"   Ruta del .env buscada: {settings.model_config.get('env_file', '.env')}")
        return False
    
    if settings.OPENAI_API_KEY == "":
        print("❌ ERROR: OPENAI_API_KEY está vacía en .env")
        return False
    
    print(f"✅ OPENAI_API_KEY encontrada (longitud: {len(settings.OPENAI_API_KEY)} caracteres)")
    print(f"   Primeros 10 caracteres: {settings.OPENAI_API_KEY[:10]}...")
    
    # Verificar que el servicio está inicializado
    if not openai_service.is_connected():
        print("❌ ERROR: El servicio de OpenAI no está conectado")
        return False
    
    print("✅ Servicio de OpenAI inicializado correctamente")
    
    # Realizar una prueba de chat
    print("\n" + "-" * 60)
    print("Realizando prueba de chat...")
    print("-" * 60)
    
    try:
        test_messages = [
            {"role": "user", "content": "Hola, ¿puedes responder con solo 'OK' para confirmar que funciona?"}
        ]
        
        response = openai_service.get_chat_response(test_messages)
        
        print(f"\n✅ Respuesta recibida de OpenAI:")
        print(f"   {response}")
        print("\n" + "=" * 60)
        print("✅ PRUEBA EXITOSA: La API de OpenAI está funcionando correctamente")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR al llamar a la API de OpenAI:")
        print(f"   {str(e)}")
        print("\n" + "=" * 60)
        print("❌ PRUEBA FALLIDA")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = test_openai_connection()
    sys.exit(0 if success else 1)

