import api from './api';

export const documentService = {
  // Upload document
  uploadDocument: async (file, category) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents
  getDocuments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/api/documents${queryString ? '?' + queryString : ''}`);
    return response.data;
  },

  // Get document by ID
  getDocument: async (documentId) => {
    const response = await api.get(`/api/documents/${documentId}`);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await api.delete(`/api/documents/${documentId}`);
    return response.data;
  },
};
