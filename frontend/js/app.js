// Main Application Logic
class FinoraApp {
    constructor() {
        this.currentCompany = null;
        this.chatHistory = [];
        this.isAuthenticated = false;
        this.sessionId = null;
        
        this.init();
    }

    init() {
        // Check if already logged in
        const authToken = sessionStorage.getItem('finora_auth');
        if (authToken) {
            this.isAuthenticated = true;
            this.showMainApp();
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation tabs
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Search functionality
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Popular stock chips
        document.querySelectorAll('.stock-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const symbol = e.currentTarget.dataset.symbol;
                document.getElementById('searchInput').value = symbol;
                this.handleSearch();
            });
        });

        // Refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            this.refreshCurrentCompany();
        });

        // Chat functionality
        document.getElementById('sendChatBtn')?.addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
    }

    // ===== Authentication =====
    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        // Hardcoded credentials (should match backend .env)
        const validEmail = 'admin@finora.ai';
        const validPassword = 'finora2024';

        if (email === validEmail && password === validPassword) {
            sessionStorage.setItem('finora_auth', btoa(email + ':' + password));
            this.isAuthenticated = true;
            this.showMainApp();
            this.showToast('Welcome to Finora AI! 🎉', 'success');
            errorDiv.textContent = '';
        } else {
            errorDiv.textContent = '❌ Invalid credentials. Please try again.';
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }

    handleLogout() {
        sessionStorage.removeItem('finora_auth');
        this.isAuthenticated = false;
        this.currentCompany = null;
        this.chatHistory = [];
        this.sessionId = null;
        
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        
        // Clear form
        document.getElementById('loginForm').reset();
        
        this.showToast('Logged out successfully', 'info');
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
    }

    // ===== Navigation =====
    switchTab(tabName) {
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.tab === tabName) {
                link.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`)?.classList.add('active');
    }

    // ===== Search =====
    async handleSearch() {
        const input = document.getElementById('searchInput');
        const symbol = input.value.trim().toUpperCase();
        
        if (!symbol) {
            this.showToast('Please enter a stock symbol', 'error');
            return;
        }

        const loadingDiv = document.getElementById('searchLoading');
        const errorDiv = document.getElementById('searchError');
        const searchBtn = document.getElementById('searchBtn');

        try {
            // Show loading
            loadingDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            searchBtn.disabled = true;

            // Analyze company (this will fetch data if needed and return complete info)
            const analysisData = await api.analyzeCompany(symbol);
            
            if (!analysisData.ok) {
                throw new Error(analysisData.error || 'Failed to analyze company');
            }

            // Use the returned data
            this.currentCompany = analysisData.data;
            this.renderDashboard(this.currentCompany);
            this.switchTab('dashboard');
            this.enableChat();
            
            const cacheMsg = analysisData.cached ? ' (from cache)' : '';
            this.showToast(`Analysis complete for ${symbol}!${cacheMsg}`, 'success');

        } catch (error) {
            errorDiv.textContent = `❌ ${error.message}`;
            errorDiv.style.display = 'block';
            this.showToast(error.message, 'error');
        } finally {
            loadingDiv.style.display = 'none';
            searchBtn.disabled = false;
        }
    }

    async refreshCurrentCompany() {
        if (!this.currentCompany) return;

        const refreshBtn = document.getElementById('refreshBtn');
        
        try {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

            const data = await api.refreshCompanyData(this.currentCompany.symbol);
            
            if (data.ok) {
                this.currentCompany = data.data;
                this.renderDashboard(data.data);
                this.showToast('Data refreshed successfully!', 'success');
            }

        } catch (error) {
            this.showToast('Failed to refresh data', 'error');
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        }
    }

    // ===== Dashboard Rendering =====
    renderDashboard(companyData) {
        const { symbol, name, metrics, analysis, chartData } = companyData;

        // Update header
        document.getElementById('companyName').textContent = name || symbol;
        document.getElementById('companySymbol').textContent = symbol;

        // Build dashboard HTML
        const dashboardHTML = `
            <!-- Key Metrics Grid -->
            <div class="metrics-grid">
                ${chartManager.createMetricCard('Market Cap', chartManager.formatCurrency(metrics.marketCap || 0))}
                ${chartManager.createMetricCard('PE Ratio', metrics.peRatio || 'N/A')}
                ${chartManager.createMetricCard('EPS', '$' + (metrics.eps || 0))}
                ${chartManager.createMetricCard('Dividend Yield', chartManager.formatPercentage(metrics.dividendYield || 0))}
                ${chartManager.createMetricCard('52 Week High', '$' + chartManager.formatNumber(metrics.fiftyTwoWeekHigh || 0))}
                ${chartManager.createMetricCard('52 Week Low', '$' + chartManager.formatNumber(metrics.fiftyTwoWeekLow || 0))}
                ${chartManager.createMetricCard('Profit Margin', chartManager.formatPercentage(metrics.profitMargin || 0))}
                ${chartManager.createMetricCard('ROE', chartManager.formatPercentage(metrics.roe || 0))}
            </div>

            <!-- AI Analysis -->
            ${this.renderAnalysisSection(analysis)}

            <!-- Stock Chart -->
            <div class="analysis-section">
                <h3><i class="fas fa-chart-line"></i> Price History (90 Days)</h3>
                <div style="height: 300px; position: relative;">
                    <canvas id="priceChart"></canvas>
                </div>
            </div>

            <!-- Additional Metrics -->
            <div class="analysis-section">
                <h3><i class="fas fa-info-circle"></i> Company Information</h3>
                <div class="metrics-grid">
                    ${chartManager.createMetricCard('Sector', metrics.sector || 'N/A')}
                    ${chartManager.createMetricCard('Industry', metrics.industry || 'N/A')}
                    ${chartManager.createMetricCard('Beta', metrics.beta || 'N/A')}
                    ${chartManager.createMetricCard('Debt/Equity', metrics.debtEquity || 'N/A')}
                </div>
            </div>
        `;

        document.getElementById('dashboardContent').innerHTML = dashboardHTML;

        // Render chart if chart data is available
        if (chartData && chartData.length > 0) {
            const chartInfo = chartManager.parseChartData(chartData, 90);
            setTimeout(() => {
                chartManager.createLineChart('priceChart', chartInfo.labels, chartInfo.data, 'Stock Price');
            }, 100);
        }
    }

    renderAnalysisSection(analysis) {
        if (!analysis) {
            return '<div class="analysis-section"><p>No analysis available</p></div>';
        }

        const riskLevel = (analysis.risk || 'Medium').toLowerCase();
        
        let insightsHTML = '';
        
        // Handle insights object (peRatio, roe, etc.)
        if (analysis.insights && typeof analysis.insights === 'object') {
            insightsHTML = '<div class="analysis-section"><h3><i class="fas fa-lightbulb"></i> Key Insights</h3><ul class="insight-list">';
            
            for (const [key, value] of Object.entries(analysis.insights)) {
                if (value && typeof value === 'string') {
                    insightsHTML += `<li><strong>${this.formatMetricName(key)}:</strong> ${value}</li>`;
                }
            }
            
            insightsHTML += '</ul></div>';
        }
        
        return `
            <div class="analysis-section">
                <h3><i class="fas fa-brain"></i> AI Analysis Summary</h3>
                <p style="margin-bottom: 20px; line-height: 1.8; color: #1F2937;">
                    ${analysis.summary || 'No summary available'}
                </p>
                <div style="margin-bottom: 20px;">
                    <strong>Risk Assessment:</strong>
                    <span class="risk-badge ${riskLevel}" style="margin-left: 10px; padding: 4px 12px; border-radius: 4px; font-weight: bold;">
                        ${analysis.risk || 'Medium'}
                    </span>
                </div>
                <div style="margin-bottom: 20px;">
                    <strong>Suggestion:</strong>
                    <p style="margin-top: 8px; color: #6B7280;">${analysis.suggestion || 'No suggestion available'}</p>
                </div>
            </div>

            ${insightsHTML}
        `;
    }

    formatMetricName(key) {
        // Convert camelCase to Title Case
        const formatted = key.replace(/([A-Z])/g, ' $1').trim();
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    // ===== Chat =====
    enableChat() {
        if (!this.currentCompany) return;

        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendChatBtn');
        const companyInfo = document.getElementById('chatCompanyInfo');

        chatInput.disabled = false;
        sendBtn.disabled = false;
        companyInfo.textContent = `Chatting about ${this.currentCompany.name} (${this.currentCompany.symbol})`;

        // Clear previous chat
        this.chatHistory = [];
        this.sessionId = null;
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="chat-message bot">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Hi! I'm ready to answer your questions about ${this.currentCompany.name}. Ask me anything about their financials, metrics, or investment potential!</p>
                </div>
            </div>
        `;
    }

    async sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message || !this.currentCompany) return;

        // Add user message to chat
        this.addChatMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        const typingId = this.showTypingIndicator();

        try {
            const response = await api.sendChatMessage(message, this.currentCompany.symbol);
            
            this.removeTypingIndicator(typingId);
            
            if (response.ok) {
                // Store session ID
                if (response.sessionId) {
                    this.sessionId = response.sessionId;
                }
                
                this.addChatMessage(response.message, 'bot');
                
                // Show sources if available
                if (response.sources && response.sources.length > 0) {
                    const sourcesHTML = '<div style="margin-top: 10px; font-size: 0.85em; color: #6B7280;"><strong>📚 Sources:</strong><br>' + 
                        response.sources.slice(0, 3).map(url => `<a href="${url}" target="_blank" style="color: #4F46E5;">${url}</a>`).join('<br>') + 
                        '</div>';
                    this.addChatMessage(sourcesHTML, 'bot', true);
                }
            } else {
                throw new Error(response.error || 'Failed to get response');
            }

        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
            this.showToast(error.message, 'error');
        }
    }

    addChatMessage(text, type, isHTML = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        const content = isHTML ? text : `<p>${text}</p>`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${type === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                ${content}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        const typingId = 'typing-' + Date.now();
        typingDiv.id = typingId;
        typingDiv.className = 'chat-message bot';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p><i class="fas fa-ellipsis-h fa-pulse"></i> Thinking...</p>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return typingId;
    }

    removeTypingIndicator(typingId) {
        const typingDiv = document.getElementById(typingId);
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    // ===== Utilities =====
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast show';
        
        // Add type-specific styling
        if (type === 'success') {
            toast.style.backgroundColor = '#10B981';
        } else if (type === 'error') {
            toast.style.backgroundColor = '#EF4444';
        } else {
            toast.style.backgroundColor = '#4F46E5';
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinoraApp();
});
