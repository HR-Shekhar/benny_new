from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.schemas.user import UserInDB
from app.schemas.chatbot import ChatbotRequest, ChatbotResponse
from app.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


def get_chatbot_service() -> ChatbotService:
    """Dependency to get chatbot service."""
    return ChatbotService()


@router.post("/ask", response_model=ChatbotResponse)
async def ask_question(
    request: ChatbotRequest,
    chatbot_service: ChatbotService = Depends(get_chatbot_service),
    current_user: UserInDB = Depends(get_current_user),
):
    """
    Ask a question to the Benny chatbot.
    Requires authentication.
    """
    try:
        answer = chatbot_service.ask_question(
            question=request.question,
            session_id=request.session_id
        )
        return ChatbotResponse(
            answer=answer,
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )


@router.post("/reset")
async def reset_conversation(
    chatbot_service: ChatbotService = Depends(get_chatbot_service),
    current_user: UserInDB = Depends(get_current_user),
):
    """
    Reset the conversation history.
    Requires authentication.
    """
    try:
        chatbot_service.reset_conversation()
        return {"message": "Conversation history reset successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting conversation: {str(e)}"
        )


