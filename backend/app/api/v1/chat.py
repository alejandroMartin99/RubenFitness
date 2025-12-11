"""
Chat API Endpoints
Handles AI assistant chat interactions
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.models.schemas import (
    ChatRequest, ChatResponse,
    ConversationCreateRequest, ConversationUpdateRequest,
    ConversationResponse, ConversationsListResponse
)
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
        # Build user context with profile data (peso, grasa, músculo, objetivo...)
        profile_context = None
        try:
            prof = supabase_service.get_profile(request.user_id)
            if prof:
                profile_context = {
                    "weight_kg": prof.get("weight_kg"),
                    "body_fat_percent": prof.get("body_fat_percent"),
                    "muscle_mass_kg": prof.get("muscle_mass_kg"),
                    "goal": prof.get("goal"),
                    "training_frequency": prof.get("training_frequency"),
                    "activity_level": prof.get("activity_level"),
                }
        except Exception as e:
            print(f"Warning: could not load profile for context: {e}")

        user_context = {
            "user_id": request.user_id,
            "additional_context": request.context,
            "profile": profile_context
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
                content=request.message,
                conversation_id=(request.context or {}).get("session_id") if request.context else None
            )
        except Exception as e:
            print(f"Warning: Could not save user message: {e}")
        
        try:
            supabase_service.save_chat_message(
                user_id=request.user_id,
                role="assistant",
                content=assistant_response,
                conversation_id=(request.context or {}).get("session_id") if request.context else None
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


@router.post("/chat/conversations", response_model=ConversationResponse)
async def create_conversation(request: ConversationCreateRequest):
    try:
        conv = supabase_service.create_conversation(request.user_id, request.title)
        if not conv:
            raise HTTPException(status_code=400, detail="Could not create conversation")
        return ConversationResponse(
            id=str(conv.get("id")),
            user_id=str(conv.get("user_id")),
            title=conv.get("title", "Nuevo chat"),
            created_at=conv.get("created_at"),
            updated_at=conv.get("updated_at"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating conversation: {str(e)}")


@router.get("/chat/conversations/{user_id}", response_model=ConversationsListResponse)
async def list_conversations(user_id: str):
    try:
        rows = supabase_service.list_conversations(user_id)
        conversations = [
            ConversationResponse(
                id=str(r.get("id")),
                user_id=str(r.get("user_id")),
                title=r.get("title", "Nuevo chat"),
                created_at=r.get("created_at"),
                updated_at=r.get("updated_at"),
            ) for r in rows
        ]
        return ConversationsListResponse(conversations=conversations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing conversations: {str(e)}")


@router.patch("/chat/conversations/{conversation_id}")
async def rename_conversation(conversation_id: str, request: ConversationUpdateRequest):
    try:
        ok = supabase_service.rename_conversation(conversation_id, request.title)
        if not ok:
            raise HTTPException(status_code=400, detail="Could not rename conversation")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error renaming conversation: {str(e)}")


@router.delete("/chat/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    try:
        ok = supabase_service.delete_conversation(conversation_id)
        if not ok:
            raise HTTPException(status_code=400, detail="Could not delete conversation")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")


@router.get("/chat/conversations/{conversation_id}/messages")
async def messages_by_conversation(conversation_id: str, limit: int = 200):
    try:
        rows = supabase_service.list_messages_by_conversation(conversation_id, limit)
        return {
            "conversation_id": conversation_id,
            "messages": [
                {
                    "role": r.get("role", "assistant"),
                    "content": r.get("content", ""),
                    "timestamp": r.get("created_at")
                } for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversation messages: {str(e)}")

