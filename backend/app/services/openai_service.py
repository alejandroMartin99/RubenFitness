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
            return self._get_mock_response(messages)
        
        try:
            # Build system message with context
            system_message = self._build_system_message(user_context)
            
            # Prepare messages for OpenAI
            openai_messages = [system_message] + messages
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using cheaper model for development
                messages=openai_messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return self._get_mock_response(messages)
    
    def _build_system_message(self, user_context: Optional[Dict[str, Any]]) -> Dict[str, str]:
        """Build system message with context"""
        base_prompt = """
        You are Rubén, an expert AI fitness coach and nutritionist. 
        You help users achieve their fitness goals through personalized training plans and advice.
        
        Your personality is:
        - Motivational and encouraging
        - Professional but friendly
        - Knowledgeable about fitness and health
        - Clear and concise in your explanations
        
        Always provide practical, safe, and actionable advice.
        """
        
        if user_context:
            # Add user-specific context
            context_str = f"\nUser context: {user_context}"
            base_prompt += context_str
        
        return {"role": "system", "content": base_prompt}
    
    def _get_mock_response(self, messages: List[Dict[str, str]]) -> str:
        """Return mock response for development/testing"""
        user_message = messages[-1].get("content", "") if messages else ""
        
        mock_responses = [
            "I understand you're looking for fitness guidance. Let's work on your goals together!",
            "That's a great question! Based on your fitness level, I'd recommend starting with basic strength training.",
            "Remember: consistency is key to achieving your fitness goals. Keep pushing forward!",
            "Let me help you create a personalized workout plan that fits your schedule and goals.",
        ]
        
        # Simple keyword matching for more realistic mock responses
        user_lower = user_message.lower()
        if "workout" in user_lower or "exercise" in user_lower:
            return "I'd be happy to help you create a workout plan! What are your primary fitness goals - strength, endurance, weight loss, or general fitness?"
        elif "diet" in user_lower or "nutrition" in user_lower or "eating" in user_lower:
            return "Nutrition is a crucial part of your fitness journey! A balanced diet with adequate protein, carbs, and healthy fats is essential. What specific nutrition questions do you have?"
        elif "motivation" in user_lower or "struggling" in user_lower:
            return "I understand how challenging it can be to stay motivated! Remember why you started, and focus on small, consistent progress. Every workout counts - you've got this!"
        elif "start" in user_lower or "beginner" in user_lower:
            return "Great that you're ready to start your fitness journey! I recommend beginning with 2-3 full-body workouts per week, focusing on form over intensity. Would you like me to create a beginner-friendly workout plan?"
        elif "schedule" in user_lower or "time" in user_lower:
            return "Finding time for fitness can be tough! Even 20-30 minutes of exercise a few times a week can make a huge difference. What does your weekly schedule look like?"
        else:
            return "I'm here to support your fitness journey! Whether you need workout plans, nutrition advice, or motivation, I'm ready to help. What specific area would you like to focus on?"
    
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


