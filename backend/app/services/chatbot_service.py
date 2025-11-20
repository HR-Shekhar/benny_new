from typing import Optional
from app.utils.rag_chatbot import BennyAssistant, get_llm, get_embeddings, load_vector_db
import os

# Global assistant instance (singleton pattern)
_assistant_instance: Optional[BennyAssistant] = None


def get_chatbot_assistant() -> BennyAssistant:
    """Get or create the chatbot assistant instance (singleton)."""
    global _assistant_instance
    
    if _assistant_instance is None:
        try:
            print("Initializing embeddings...")
            embeddings = get_embeddings()
            print("Loading vector database...")
            vector_db = load_vector_db()
            print("Initializing LLM...")
            llm = get_llm()
            print("Creating chatbot assistant...")
            _assistant_instance = BennyAssistant(llm, vector_db)
            print("✅ Chatbot assistant initialized successfully")
        except Exception as e:
            error_msg = f"Failed to initialize chatbot: {str(e)}"
            print(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
    
    return _assistant_instance


class ChatbotService:
    """Service for handling chatbot interactions."""
    
    def __init__(self):
        self.assistant = get_chatbot_assistant()
    
    def ask_question(self, question: str, session_id: Optional[str] = None) -> str:
        """
        Ask a question to the chatbot.
        
        Args:
            question: The user's question
            session_id: Optional session ID for maintaining conversation history
        
        Returns:
            The chatbot's response
        """
        if not question or not question.strip():
            return "Please provide a valid question."
        
        try:
            # For now, we use a single assistant instance
            # In the future, you could maintain separate instances per session_id
            response = self.assistant.ask(question.strip())
            return response
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"
    
    def reset_conversation(self, session_id: Optional[str] = None):
        """Reset the conversation history."""
        if session_id is None:
            # Reset the global instance
            self.assistant.history = []
            self.assistant.user_name = None
        # In the future, you could reset per-session instances

