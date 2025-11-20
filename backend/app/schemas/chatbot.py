from pydantic import BaseModel, Field
from typing import Optional

class ChatbotRequest(BaseModel):
    question: str = Field(..., min_length=1, description="The user's question")
    session_id: Optional[str] = Field(None, description="Optional session ID for conversation history")

class ChatbotResponse(BaseModel):
    answer: str = Field(..., description="The chatbot's response")
    session_id: Optional[str] = Field(None, description="Session ID for maintaining conversation")

