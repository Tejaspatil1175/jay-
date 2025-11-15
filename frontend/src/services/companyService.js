import api from './api';

export const companyService = {
  // Get company data
  getCompany: async (symbol) => {
    const response = await api.get(`/api/company/${symbol}`);
    return response.data;
  },

  // Refresh company data
  refreshCompany: async (symbol) => {
    const response = await api.get(`/api/company/${symbol}/refresh`);
    return response.data;
  },

  // Get all stored companies
  getAllCompanies: async () => {
    const response = await api.get('/api/company');
    return response.data;
  },

  // Analyze company
  analyzeCompany: async (symbol) => {
    const response = await api.post(`/api/analyze/${symbol}`);
    return response.data;
  },
};
