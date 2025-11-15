const axios = require('axios');

class WebSearchService {
  /**
   * Perform web search using DuckDuckGo HTML scraping
   * Note: This is a simple implementation. For production, consider using:
   * - SerpAPI
   * - Google Custom Search API
   * - Bing Search API
   */
  async search(query, maxResults = 5) {
    try {
      // Simple DuckDuckGo HTML search
      const url = `https://html.duckduckgo.com/html/`;
      
      const response = await axios.post(url, `q=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      // Parse HTML response (basic extraction)
      const html = response.data;
      const results = this.parseSearchResults(html, maxResults);

      return results;
    } catch (error) {
      console.error('Web search error:', error.message);
      return [];
    }
  }

  /**
   * Parse HTML search results
   */
  parseSearchResults(html, maxResults) {
    const results = [];
    
    try {
      // Basic regex to extract links and titles
      const linkRegex = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g;
      
      let match;
      let count = 0;
      
      while ((match = linkRegex.exec(html)) !== null && count < maxResults) {
        results.push({
          title: match[2].trim(),
          url: match[1],
          snippet: ''
        });
        count++;
      }

      // Try to add snippets
      count = 0;
      while ((match = snippetRegex.exec(html)) !== null && count < results.length) {
        if (results[count]) {
          results[count].snippet = match[1].trim();
        }
        count++;
      }
    } catch (error) {
      console.error('Error parsing search results:', error.message);
    }

    return results;
  }

  /**
   * Format search results for AI context
   */
  formatResultsForAI(results) {
    if (!results || results.length === 0) {
      return null;
    }

    return results.map((result, index) => 
      `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.url}`
    ).join('\n\n');
  }

  /**
   * Search for company-specific news
   */
  async searchCompanyNews(companyName, symbol) {
    const query = `${companyName} ${symbol} stock news latest`;
    const results = await this.search(query, 5);
    return results;
  }

  /**
   * Search for financial information
   */
  async searchFinancialInfo(query) {
    const results = await this.search(query, 5);
    return results;
  }
}

module.exports = new WebSearchService();
