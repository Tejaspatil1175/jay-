const axios = require('axios');
const { GEMINI } = require('../config/constants');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = GEMINI.BASE_URL;
    this.model = GEMINI.MODEL;
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(prompt) {
    try {
      const url = `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await axios.post(
        url,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: GEMINI.TEMPERATURE,
            maxOutputTokens: GEMINI.MAX_TOKENS,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: GEMINI.TIMEOUT
        }
      );

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const text = response.data.candidates[0].content.parts[0].text;
      return {
        text,
        raw: response.data
      };
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      
      // Better error message for common issues
      if (error.response?.status === 404) {
        console.error(`❌ Model '${this.model}' not found. Available models: gemini-1.5-flash, gemini-1.5-pro, gemini-pro`);
      }
      
      throw new Error('Failed to generate AI response: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  /**
   * Analyze financial metrics
   */
  async analyzeFinancials(metrics) {
    const prompt = `
You are an expert financial analyst. Analyze the following company metrics and provide a comprehensive analysis in JSON format.

Company Metrics:
${JSON.stringify(metrics, null, 2)}

Provide your analysis in the following JSON structure:
{
  "summary": "2-3 sentence summary of the company's overall financial health",
  "insights": {
    "peRatio": "Plain English explanation of PE Ratio (1 sentence)",
    "roe": "Plain English explanation of ROE (1 sentence)",
    "debtEquity": "Plain English explanation of Debt/Equity ratio (1 sentence)",
    "profitMargin": "Plain English explanation of Profit Margin (1 sentence)",
    "revenue": "Plain English explanation of Revenue trends (1 sentence)",
    "eps": "Plain English explanation of EPS (1 sentence)"
  },
  "risk": "Low/Medium/High with brief justification",
  "suggestion": "One-line actionable suggestion for retail investors"
}

Important: 
- Use simple language that a beginner investor can understand
- Avoid jargon where possible, or explain it
- Be honest about risks
- Base analysis only on provided data
- Return ONLY valid JSON, no markdown or extra text
`;

    try {
      const result = await this.generateContent(prompt);
      
      // Try to parse JSON from response
      let analysis;
      try {
        // Remove markdown code blocks if present
        const cleanText = result.text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        analysis = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', parseError.message);
        // Fallback structure
        analysis = {
          summary: result.text,
          insights: {},
          risk: 'Medium',
          suggestion: 'Further analysis recommended'
        };
      }

      return {
        ...analysis,
        llmModel: this.model,
        llmRawResponse: result.raw
      };
    } catch (error) {
      console.error('Gemini analyzeFinancials Error:', error.message);
      throw error;
    }
  }

  /**
   * Chat with context (for chatbot)
   */
  async chatWithContext(userMessage, companyData, chatHistory = [], webSearchResults = null) {
    const contextPrompt = `
You are a helpful financial assistant helping a retail investor understand their selected company.

Company Context:
Symbol: ${companyData.symbol}
Name: ${companyData.name}
Key Metrics: ${JSON.stringify(companyData.metrics, null, 2)}
Analysis Summary: ${companyData.analysis?.summary || 'No analysis available'}

${webSearchResults ? `Recent Web Search Results:\n${webSearchResults}\n` : ''}

${chatHistory.length > 0 ? `Previous Conversation:\n${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n` : ''}

User Question: ${userMessage}

Instructions:
- Answer based on the company data provided
- Use simple language for retail investors
- If you used web search results, cite them
- If data is missing, acknowledge it honestly
- Keep responses concise and actionable
- Don't make up data

Your Response:
`;

    try {
      const result = await this.generateContent(contextPrompt);
      return result.text;
    } catch (error) {
      console.error('Gemini chatWithContext Error:', error.message);
      throw error;
    }
  }

  /**
   * Determine if web search is needed
   */
  async shouldUseWebSearch(userMessage, companyData) {
    const prompt = `
Given this user question about a company: "${userMessage}"

And this available company data:
${JSON.stringify(companyData, null, 2)}

Respond with ONLY "YES" or "NO" - does this question require current/real-time information that isn't in the company data?

Examples:
- "What's the current stock price?" -> YES
- "Latest news about this company?" -> YES
- "What's the PE ratio?" -> NO (if in data)
- "Explain the profit margin" -> NO
- "Recent earnings report?" -> YES

Your answer (YES or NO):
`;

    try {
      const result = await this.generateContent(prompt);
      const answer = result.text.trim().toUpperCase();
      return answer.includes('YES');
    } catch (error) {
      console.error('Gemini shouldUseWebSearch Error:', error.message);
      return false; // Default to no web search on error
    }
  }
}

module.exports = new GeminiService();
