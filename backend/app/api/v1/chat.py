"""
Chat API Endpoints
Handles AI assistant chat interactions
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.schemas import ChatRequest, ChatResponse
from app.services.openai_service import openai_service
from app.services.supabase_service import supabase_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the AI fitness assistant
    
    Args:
        request: Chat request containing user_id and message
    
    Returns:
        ChatResponse with AI assistant's response
    """
    try:
        # Get user's chat history
        chat_history = supabase_service.get_chat_history(request.user_id, limit=5)
        
        # Convert chat history to OpenAI format
        messages = [
            {"role": msg.role, "content": msg.content} 
            for msg in chat_history
        ]
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Get AI response
        user_context = {
            "user_id": request.user_id,
            "additional_context": request.context
        }
        
        assistant_response = openai_service.get_chat_response(
            messages, 
            user_context=user_context
        )
        
        # Save messages to database (non-blocking)
        try:
            supabase_service.save_chat_message(
                user_id=request.user_id,
                role="user",
                content=request.message
            )
        except Exception as e:
            print(f"Warning: Could not save user message: {e}")
        
        try:
            supabase_service.save_chat_message(
                user_id=request.user_id,
                role="assistant",
                content=assistant_response
            )
        except Exception as e:
            print(f"Warning: Could not save assistant message: {e}")
        
        return ChatResponse(
            message=assistant_response,
            user_id=request.user_id,
            timestamp=datetime.utcnow()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")


@router.get("/chat/history/{user_id}")
async def get_chat_history(user_id: str, limit: int = 20):
    """
    Get user's chat history
    
    Args:
        user_id: User identifier
        limit: Maximum number of messages to return
    
    Returns:
        List of chat messages
    """
    try:
        history = supabase_service.get_chat_history(user_id, limit=limit)
        return {
            "user_id": user_id,
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
                }
                for msg in history
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chat history: {str(e)}")


