import api from './api';

export const chatService = {
  // Send message to chatbot
  sendMessage: async (data) => {
    const response = await api.post('/api/chat', data);
    return response.data;
  },

  // Get chat history
  getHistory: async (sessionId = null) => {
    const url = sessionId ? `/api/chat/history/${sessionId}` : '/api/chat/history';
    const response = await api.get(url);
    return response.data;
  },

  // Get chat history (alias for compatibility)
  getChatHistory: async (sessionId) => {
    const response = await api.get(`/api/chat/history/${sessionId}`);
    return response.data;
  },

  // Start new chat session
  startNewChat: async (symbol) => {
    const response = await api.post('/api/chat/new', symbol ? { symbol } : {});
    return response.data;
  },

  // Start new session (alias)
  startNewSession: async (symbol) => {
    const response = await api.post('/api/chat/new', { symbol });
    return response.data;
  },

  // Delete chat history
  deleteChatHistory: async (sessionId) => {
    const response = await api.delete(`/api/chat/history/${sessionId}`);
    return response.data;
  },
};
