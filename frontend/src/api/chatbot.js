import apiClient from './client';

export const chatbotAPI = {
  // Ask a question to the chatbot
  askQuestion: (question, sessionId = null) => 
    apiClient.post('/chatbot/ask', {
      question,
      session_id: sessionId,
    }),

  // Reset conversation history
  resetConversation: () => 
    apiClient.post('/chatbot/reset'),
};

