// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service
class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Get company data by symbol
     */
    async getCompanyData(symbol) {
        return this.request(`/company/${symbol.toUpperCase()}`);
    }

    /**
     * Analyze company
     */
    async analyzeCompany(symbol) {
        return this.request(`/analyze/${symbol.toUpperCase()}`, {
            method: 'POST'
        });
    }

    /**
     * Refresh company data
     */
    async refreshCompanyData(symbol) {
        return this.request(`/company/${symbol.toUpperCase()}/refresh`);
    }

    /**
     * Send chat message
     */
    async sendChatMessage(message, companySymbol) {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                symbol: companySymbol.toUpperCase()
            })
        });
    }

    /**
     * Get all stored companies
     */
    async getAllCompanies() {
        return this.request('/company');
    }
}

// Create and export API instance
const api = new APIService();
