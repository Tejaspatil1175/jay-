// Chart.js Configuration and Utilities
class ChartManager {
    constructor() {
        this.charts = {};
    }

    /**
     * Create a metric card
     */
    createMetricCard(label, value, change = null) {
        const changeHTML = change ? `
            <div class="metric-change ${change >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i>
                ${Math.abs(change).toFixed(2)}%
            </div>
        ` : '';

        return `
            <div class="metric-card">
                <div class="metric-label">${label}</div>
                <div class="metric-value">${value}</div>
                ${changeHTML}
            </div>
        `;
    }

    /**
     * Create line chart for stock price
     */
    createLineChart(canvasId, labels, data, label) {
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#4F46E5',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: '#E5E7EB'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Create bar chart for metrics comparison
     */
    createBarChart(canvasId, labels, data, label) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: [
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        '#4F46E5',
                        '#06B6D4',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1F2937',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            color: '#E5E7EB'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Format currency
     */
    formatCurrency(value) {
        if (value >= 1e12) {
            return '$' + (value / 1e12).toFixed(2) + 'T';
        } else if (value >= 1e9) {
            return '$' + (value / 1e9).toFixed(2) + 'B';
        } else if (value >= 1e6) {
            return '$' + (value / 1e6).toFixed(2) + 'M';
        } else if (value >= 1e3) {
            return '$' + (value / 1e3).toFixed(2) + 'K';
        } else {
            return '$' + parseFloat(value).toFixed(2);
        }
    }

    /**
     * Format number with commas
     */
    formatNumber(value) {
        return parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Format percentage
     */
    formatPercentage(value) {
        return parseFloat(value).toFixed(2) + '%';
    }

    /**
     * Parse time series data for charts
     */
    parseTimeSeriesData(timeSeriesData, days = 90) {
        const dates = Object.keys(timeSeriesData).sort().slice(-days);
        const prices = dates.map(date => parseFloat(timeSeriesData[date]['4. close']));
        
        return {
            labels: dates.map(date => {
                const d = new Date(date);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            data: prices
        };
    }

    /**
     * Parse chart data from backend format
     */
    parseChartData(chartData, days = 90) {
        if (!chartData || chartData.length === 0) {
            return { labels: [], data: [] };
        }

        // Sort by date and take last N days
        const sortedData = chartData
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-days);

        return {
            labels: sortedData.map(item => {
                const d = new Date(item.date);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            data: sortedData.map(item => parseFloat(item.close))
        };
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Create and export chart manager instance
const chartManager = new ChartManager();
