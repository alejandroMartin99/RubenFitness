"""
OpenAI Service
Wrapper for OpenAI API interactions (chat completions, streaming)
"""

from typing import List, Dict, Any, Optional
from openai import OpenAI
from app.core.config import settings


class OpenAIService:
    """Service for managing OpenAI API interactions"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        self.client: Optional[OpenAI] = None
        if settings.OPENAI_API_KEY:
            try:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                print(f"Warning: Could not initialize OpenAI client: {e}")
    
    def is_connected(self) -> bool:
        """Check if OpenAI is connected"""
        return self.client is not None
    
    def get_chat_response(
        self, 
        messages: List[Dict[str, str]], 
        user_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get chat completion from OpenAI
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            user_context: Optional user context information
        
        Returns:
            Assistant's response as a string
        """
        if not self.is_connected():
            return self._get_mock_response(messages, user_context)
        
        try:
        # Build system message with context
        system_message = self._build_system_message(user_context)
            
            # Prepare messages for OpenAI
            openai_messages = [system_message] + messages
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using cheaper model for development
                messages=openai_messages,
                temperature=0.8,  # Slightly higher for more natural responses
                max_tokens=800  # Increased for more detailed responses
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return self._get_mock_response(messages)
    
    def _build_system_message(self, user_context: Optional[Dict[str, Any]]) -> Dict[str, str]:
        """Build system message with context"""
        base_prompt = """Eres Rubén, un coach personal de fitness y nutricionista profesional con años de experiencia.

TU PERSONALIDAD:
- Motivacional y alentador, pero siempre profesional
- Empatético y cercano, pero manteniendo autoridad
- Conocimiento profundo en entrenamiento, nutrición y fisiología del ejercicio
- Comunicación clara, concisa y fácil de entender
- Siempre enfocado en la seguridad y resultados realistas

ESPECIALIDADES:
- Entrenamiento de fuerza y resistencia
- Programación de rutinas personalizadas (series, repeticiones, descansos, progresión)
- Nutrición deportiva y cálculo de macronutrientes
- Técnica correcta de ejercicios y prevención de lesiones
- Planificación de objetivos (pérdida de peso, ganancia muscular, mejora de rendimiento)
- Recuperación y descanso

FORMATO DE RESPUESTAS:
- Cuando hables de ejercicios: menciona series, repeticiones, descansos y progresión
- Cuando hables de nutrición: menciona calorías, macronutrientes (proteínas, carbohidratos, grasas) y timing
- Sé específico: en lugar de "haz sentadillas", di "haz 3-4 series de 8-12 repeticiones de sentadillas con 60-90 segundos de descanso"
- Proporciona ejemplos prácticos y concretos
- Si no conoces algo con certeza, admítelo en lugar de inventar información

SIEMPRE:
- Prioriza la seguridad del usuario
- Adapta tus consejos al nivel del usuario
- Proporciona información basada en evidencia científica
- Motiva con energía pero sin exagerar
- Responde en español, de forma natural y profesional"""
        
        if user_context:
            # Add user-specific context
            try:
                profile = user_context.get("profile") if isinstance(user_context, dict) else None
            except Exception:
                profile = None
            context_parts = []
            if isinstance(profile, dict):
                if profile.get("weight_kg"):
                    context_parts.append(f"peso {profile.get('weight_kg')} kg")
                if profile.get("body_fat_percent"):
                    context_parts.append(f"% grasa {profile.get('body_fat_percent')}%")
                if profile.get("muscle_mass_kg"):
                    context_parts.append(f"masa muscular {profile.get('muscle_mass_kg')} kg")
                if profile.get("goal"):
                    context_parts.append(f"objetivo: {profile.get('goal')}")
                if profile.get("training_frequency"):
                    context_parts.append(f"frecuencia: {profile.get('training_frequency')}")
                if profile.get("activity_level"):
                    context_parts.append(f"nivel: {profile.get('activity_level')}")
            context_str = ""
            if context_parts:
                context_str = "\n\nDATOS DEL USUARIO (usa para personalizar): " + ", ".join(context_parts)
            base_prompt += context_str
        
        return {"role": "system", "content": base_prompt.strip()}
    
    def _get_mock_response(self, messages: List[Dict[str, str]], user_context: Optional[Dict[str, Any]] = None) -> str:
        """Return mock response for desarrollo (es) con tono pro y motivacional"""
        user_message = messages[-1].get("content", "") if messages else ""
        lower = user_message.lower()

        profile = None
        if user_context and isinstance(user_context, dict):
            profile = user_context.get("profile")
        profile_str = ""
        if isinstance(profile, dict):
            parts = []
            if profile.get("weight_kg"):
                parts.append(f"peso {profile.get('weight_kg')} kg")
            if profile.get("body_fat_percent"):
                parts.append(f"% grasa {profile.get('body_fat_percent')}%")
            if profile.get("muscle_mass_kg"):
                parts.append(f"masa muscular {profile.get('muscle_mass_kg')} kg")
            if profile.get("goal"):
                parts.append(f"objetivo {profile.get('goal')}")
            if parts:
                profile_str = " | Datos: " + ", ".join(parts)

        # Context strings
        context_str = ""
        if user_context:
            try:
                context_str = f"\n\nContexto: {user_context}"
            except Exception:
                context_str = ""

        if any(k in lower for k in ["fuerza", "hipertrofia", "serie", "repet", "rir", "rpe", "pesas", "gym", "powerlifting"]):
            return (
                "Vamos a por un plan enfocado a fuerza/hipertrofia:\n"
                "- 3-4 días/semana, básicos primero (sentadilla, press banca, peso muerto, press militar).\n"
                "- 3-4 series de 6-10 reps, RIR 1-2, descanso 2-3 min en básicos.\n"
                "- Accesorios 2-3 series de 10-15 reps, descanso 60-90s.\n"
                "- Progresión: sube 2.5-5 kg o 1-2 reps por semana si mantienes técnica.\n"
                "Mantén técnica limpia y registra cada sesión.\n"
                f"{context_str}{profile_str}"
            )

        if any(k in lower for k in ["cardio", "hiit", "liss", "aeróbico", "aerobico"]):
            return (
                "Cardio estratégico sin interferir con fuerza:\n"
                "- 2-3 sesiones LISS de 25-40 min post-entreno o días separados.\n"
                "- HIIT 1x/semana si recuperas bien (6-10 sprints de 20-30s, 1-2 min pausa).\n"
                "- Mantén 1-2 días completos de descanso/recuperación activa.\n"
                f"{context_str}"
            )

        if any(k in lower for k in ["caloría", "caloria", "déficit", "superávit", "superavit", "macros", "prote", "grasa", "carbo"]):
            return (
                "Nutrición orientada a rendimiento/recomp:\n"
                "- Proteína: 1.6-2.2 g/kg peso.\n"
                "- Grasas: 0.7-1 g/kg.\n"
                "- Carbs: resto de calorías; sube en días de pierna/fuerza.\n"
                "- Timing: pre-entreno 20-40 g prote + 30-60 g carbs; post-entreno similar.\n"
                "- Si buscas déficit: -10% a -20% calorías; superávit controlado +5-10% para masa.\n"
                f"{context_str}"
            )

        if any(k in lower for k in ["recuperación", "recuperacion", "sueño", "fatiga", "lesión", "lesion"]):
            return (
                "Recuperación pro:\n"
                "- Sueño 7.5-9 h; higieniza luz y cafeína (<8h antes de dormir).\n"
                "- Controla volumen: si hay fatiga, baja un 20-30% series una semana (deload).\n"
                "- Movilidad ligera y caminatas 20-30 min en días libres.\n"
                "- Prote 1.8-2 g/kg y 30-40 g en la comida post-entreno.\n"
                f"{context_str}"
            )

        if any(k in lower for k in ["principiante", "empezar", "start", "novato"]):
            return (
                "Empezamos simple y sólido:\n"
                "- 3 días full body: sentadilla goblet, press mancuernas, remo, peso muerto rumano, core.\n"
                "- 3x8-12 reps, RIR 2-3, descanso 90s.\n"
                "- Sube peso o reps cada semana si mantienes técnica.\n"
                "- 6-8k pasos/día y 2L agua.\n"
                f"{context_str}"
            )

        # Default mock
        return (
            "Listo para afinar tu plan. Dame tu objetivo concreto "
            "(fuerza, recomposición, definición o rendimiento) y te detallo series/reps/RIR, "
            "progresión y macros con timing. Vamos a por ello."
            f"{context_str}{profile_str}"
        )
    
    def get_streaming_response(
        self, 
        messages: List[Dict[str, str]], 
        user_context: Optional[Dict[str, Any]] = None
    ) -> Any:
        """
        Get streaming chat completion from OpenAI (for real-time responses)
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            user_context: Optional user context information
        
        Yields:
            Chunks of assistant's response
        """
        if not self.is_connected():
            # Return non-streaming mock response
            response = self._get_mock_response(messages)
            for word in response.split():
                yield word + " "
            return
        
        try:
            system_message = self._build_system_message(user_context)
            openai_messages = [system_message] + messages
            
            stream = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages,
                temperature=0.7,
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            print(f"Error streaming from OpenAI: {e}")
            response = self._get_mock_response(messages)
            for word in response.split():
                yield word + " "


# Global instance
openai_service = OpenAIService()


