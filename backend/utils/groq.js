const Groq = require('groq-sdk');

class GroqService {
  constructor() {
    this.client = new Groq({ 
      apiKey: process.env.GROQ_API_KEY
    });
    this.model = 'llama-3.3-70b-versatile'; // Updated to a stable model
  }

  /**
   * Generate text response
   */
  async generateText(prompt) {
    try {
      console.log('🤖 Groq API Request - Model:', this.model);
      
      const chatCompletion = await this.client.chat.completions.create({
        messages: [
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 4000,
      });

      if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
        throw new Error('No response from Groq API');
      }

      const text = chatCompletion.choices[0].message.content;
      console.log('✅ Groq response received:', text.length, 'characters');
      
      return text;
    } catch (error) {
      console.error('❌ Groq API Error:', error.message);
      if (error.response) {
        console.error('Error details:', JSON.stringify(error.response.data));
      }
      throw new Error('Failed to generate AI response: ' + error.message);
    }
  }

  /**
   * Generate content with system prompt
   */
  async generateContent(prompt, systemPrompt = null) {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const chatCompletion = await this.client.chat.completions.create({
        messages: messages,
        model: this.model,
        temperature: 0.7,
        max_tokens: 4000,
      });

      if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
        throw new Error('No response from Groq API');
      }

      return {
        text: chatCompletion.choices[0].message.content,
        raw: chatCompletion
      };
    } catch (error) {
      console.error('❌ Groq generateContent Error:', error.message);
      throw error;
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
      const result = await this.generateText(prompt);
      
      // Try to parse JSON from response
      let analysis;
      try {
        // Remove markdown code blocks if present
        const cleanText = result
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        analysis = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Groq JSON response:', parseError.message);
        // Fallback structure
        analysis = {
          summary: result,
          insights: {},
          risk: 'Medium',
          suggestion: 'Further analysis recommended'
        };
      }

      return {
        ...analysis,
        llmModel: this.model,
        llmProvider: 'groq'
      };
    } catch (error) {
      console.error('Groq analyzeFinancials Error:', error.message);
      throw error;
    }
  }

  /**
   * Chat with context (for chatbot)
   */
  async chatWithContext(userMessage, companyData, chatHistory = [], webSearchResults = null) {
    const systemPrompt = `You are a helpful financial assistant helping a retail investor understand their selected company.

Company Context:
Symbol: ${companyData.symbol}
Name: ${companyData.name}
Key Metrics: ${JSON.stringify(companyData.metrics, null, 2)}
Analysis Summary: ${companyData.analysis?.summary || 'No analysis available'}

${webSearchResults ? `Recent Web Search Results:\n${webSearchResults}\n` : ''}

Instructions:
- Answer based on the company data provided
- Use simple language for retail investors
- If you used web search results, cite them
- If data is missing, acknowledge it honestly
- Keep responses concise and actionable
- Don't make up data`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add chat history
    if (chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({ role: 'user', content: userMessage });

    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: messages,
        model: this.model,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return chatCompletion.choices[0].message.content;
    } catch (error) {
      console.error('Groq chatWithContext Error:', error.message);
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
      const result = await this.generateText(prompt);
      const answer = result.trim().toUpperCase();
      return answer.includes('YES');
    } catch (error) {
      console.error('Groq shouldUseWebSearch Error:', error.message);
      return false; // Default to no web search on error
    }
  }
}

module.exports = new GroqService();
