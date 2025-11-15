const { CHART } = require('../config/constants');

class DataTransformer {
  /**
   * Normalize AlphaVantage data to our schema
   */
  normalizeMetrics(overview, incomeStatement, balanceSheet, cashFlow) {
    try {
      // Extract latest annual reports
      const latestIncome = incomeStatement?.annualReports?.[0] || {};
      const latestBalance = balanceSheet?.annualReports?.[0] || {};
      const latestCashFlow = cashFlow?.annualReports?.[0] || {};

      const metrics = {
        symbol: overview.Symbol || '',
        name: overview.Name || overview.Symbol || '',
        
        // Valuation Metrics
        marketCap: this.parseNumber(overview.MarketCapitalization),
        peRatio: this.parseNumber(overview.PERatio),
        eps: this.parseNumber(overview.EPS),
        bookValue: this.parseNumber(overview.BookValue),
        dividendYield: this.parseNumber(overview.DividendYield),
        beta: this.parseNumber(overview.Beta),
        
        // Profitability Metrics
        profitMargin: this.parseNumber(overview.ProfitMargin),
        revenue: this.parseNumber(latestIncome.totalRevenue),
        netIncome: this.parseNumber(latestIncome.netIncome),
        roe: this.parseNumber(overview.ReturnOnEquityTTM),
        roa: this.parseNumber(overview.ReturnOnAssetsTTM),
        
        // Leverage Metrics
        debtEquity: this.parseNumber(overview.DebtToEquity),
        
        // Liquidity Metrics
        currentRatio: this.parseNumber(latestBalance.currentRatio),
        quickRatio: this.parseNumber(latestBalance.quickRatio),
        
        // Price Ranges
        fiftyTwoWeekHigh: this.parseNumber(overview['52WeekHigh']),
        fiftyTwoWeekLow: this.parseNumber(overview['52WeekLow']),
        
        // Company Info
        sector: overview.Sector || 'N/A',
        industry: overview.Industry || 'N/A',
        description: overview.Description || ''
      };

      return metrics;
    } catch (error) {
      console.error('Error normalizing metrics:', error.message);
      throw new Error('Failed to normalize company metrics');
    }
  }

  /**
   * Transform time series data to chart format
   */
  transformChartData(timeSeriesData) {
    try {
      if (!timeSeriesData || typeof timeSeriesData !== 'object') {
        return [];
      }

      const chartData = [];
      const dates = Object.keys(timeSeriesData).sort((a, b) => new Date(b) - new Date(a));
      
      // Limit to max data points
      const limitedDates = dates.slice(0, CHART.MAX_DATA_POINTS);

      for (const date of limitedDates) {
        const dayData = timeSeriesData[date];
        chartData.push({
          date: new Date(date),
          open: this.parseNumber(dayData['1. open']),
          high: this.parseNumber(dayData['2. high']),
          low: this.parseNumber(dayData['3. low']),
          close: this.parseNumber(dayData['4. close']),
          volume: this.parseNumber(dayData['5. volume'])
        });
      }

      // Sort by date ascending for charts
      return chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('Error transforming chart data:', error.message);
      return [];
    }
  }

  /**
   * Create historical trends for multiple years
   */
  createHistoricalTrends(incomeStatement, balanceSheet) {
    try {
      const trends = [];
      const incomeReports = incomeStatement?.annualReports || [];
      const balanceReports = balanceSheet?.annualReports || [];

      // Combine reports by fiscal year
      const years = [...new Set([
        ...incomeReports.map(r => r.fiscalDateEnding),
        ...balanceReports.map(r => r.fiscalDateEnding)
      ])].sort().reverse();

      for (const year of years.slice(0, CHART.DEFAULT_YEARS)) {
        const income = incomeReports.find(r => r.fiscalDateEnding === year) || {};
        const balance = balanceReports.find(r => r.fiscalDateEnding === year) || {};

        trends.push({
          year: year.substring(0, 4), // Extract year
          revenue: this.parseNumber(income.totalRevenue),
          netIncome: this.parseNumber(income.netIncome),
          totalAssets: this.parseNumber(balance.totalAssets),
          totalLiabilities: this.parseNumber(balance.totalLiabilities),
          shareholderEquity: this.parseNumber(balance.totalShareholderEquity)
        });
      }

      return trends;
    } catch (error) {
      console.error('Error creating historical trends:', error.message);
      return [];
    }
  }

  /**
   * Parse number safely
   */
  parseNumber(value) {
    if (value === null || value === undefined || value === 'None') {
      return null;
    }
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Calculate derived metrics
   */
  calculateDerivedMetrics(metrics) {
    const derived = { ...metrics };

    // Calculate profit margin if missing
    if (!derived.profitMargin && derived.netIncome && derived.revenue && derived.revenue !== 0) {
      derived.profitMargin = (derived.netIncome / derived.revenue) * 100;
    }

    // Calculate ROE if missing
    if (!derived.roe && derived.netIncome && derived.marketCap && derived.marketCap !== 0) {
      // Approximate ROE using market cap as proxy for equity
      derived.roe = (derived.netIncome / derived.marketCap) * 100;
    }

    return derived;
  }
}

module.exports = new DataTransformer();
