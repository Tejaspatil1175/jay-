const Company = require('../models/Company');
const ChatHistory = require('../models/ChatHistory');
const Document = require('../models/Document');
const Holding = require('../models/Holding');
const User = require('../models/User');
const groqService = require('../utils/groq');
const webSearchService = require('../utils/webSearch');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/chat
 * Enhanced chatbot with multi-source data retrieval
 * Uses: Company data, User portfolio, Documents, Web search, Vector search
 */
exports.chat = asyncHandler(async (req, res, next) => {
  const { message, symbol, sessionId } = req.body;
  const userId = req.userId; // From auth middleware (optional)

  if (!message) {
    return next(new AppError('Message is required', 400));
  }

  const currentSessionId = sessionId || uuidv4();
  
  // Initialize context object
  const context = {
    companyData: null,
    portfolioData: null,
    documentsData: null,
    webSearchResults: null
  };

  // 1. Get company data if symbol is provided
  if (symbol) {
    const upperSymbol = symbol.toUpperCase();
    const company = await Company.findOne({ symbol: upperSymbol });

    if (company) {
      context.companyData = {
        symbol: company.symbol,
        name: company.metrics?.name,
        metrics: company.metrics,
        chartData: company.chartData?.slice(0, 30), // Last 30 days
        analysis: company.analysis
      };
    }
  }

  // 2. Get user portfolio data if authenticated
  if (userId) {
    try {
      const user = await User.findById(userId);
      const holdings = await Holding.find({ userId }).limit(20);

      context.portfolioData = {
        cashBalance: user.portfolio.cashBalance,
        totalValue: user.portfolio.totalValue,
        totalInvested: user.portfolio.totalInvested,
        profitLoss: user.portfolio.profitLoss,
        holdings: holdings.map(h => ({
          symbol: h.symbol,
          quantity: h.quantity,
          currentPrice: h.currentPrice,
          profitLoss: h.profitLoss,
          profitLossPercentage: h.profitLossPercentage
        })),
        riskTolerance: user.profile?.riskTolerance,
        investmentGoals: user.profile?.investmentGoals
      };
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  }

  // 3. Get user documents if authenticated
  if (userId) {
    try {
      const documents = await Document.find({
        userId,
        processingStatus: 'COMPLETED'
      })
        .select('fileName category analysis.summary analysis.keyFindings analysis.financialMetrics')
        .limit(10);

      if (documents.length > 0) {
        context.documentsData = documents.map(doc => ({
          fileName: doc.fileName,
          category: doc.category,
          summary: doc.analysis?.summary,
          keyFindings: doc.analysis?.keyFindings,
          financialMetrics: doc.analysis?.financialMetrics
        }));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }

  // 4. Get or create chat history
  let chatHistory = await ChatHistory.findOne({ sessionId: currentSessionId });

  if (!chatHistory) {
    chatHistory = new ChatHistory({
      sessionId: currentSessionId,
      symbol: symbol?.toUpperCase() || 'GENERAL',
      messages: []
    });
  }

  const recentHistory = chatHistory.messages.slice(-10);

  // 5. Determine if web search is needed
  console.log(`🤔 Analyzing query: "${message}"`);
  const needsWebSearch = await groqService.shouldUseWebSearch(message, context.companyData);

  let sources = [];

  // 6. Perform web search if needed
  if (needsWebSearch) {
    console.log(`🔍 Performing web search...`);
    
    const searchQuery = context.companyData 
      ? `${context.companyData.name} ${context.companyData.symbol} ${message}`
      : message;

    try {
      const results = await webSearchService.search(searchQuery, 5);
      
      if (results && results.length > 0) {
        context.webSearchResults = results.map(r => ({
          title: r.title,
          snippet: r.snippet,
          url: r.url,
          source: r.source
        }));
        
        sources = results.map(r => ({
          name: r.source || r.title,
          url: r.url
        }));
      }
    } catch (error) {
      console.error('Web search error:', error);
    }
  }

  // 7. Build comprehensive prompt for Gemini
  const prompt = buildComprehensivePrompt(message, context, recentHistory);

  // 8. Generate AI response with Groq
  console.log(`🤖 Generating AI response...`);
  const aiResponse = await groqService.generateText(prompt);

  // Parse AI response (expecting JSON with answer, chart, sources)
  let parsedResponse;
  try {
    // Remove markdown code blocks if present
    let cleanResponse = aiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Try to extract JSON from response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0];
      
      // Fix common JSON issues
      jsonStr = jsonStr
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')  // Fix unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"');  // Replace single quotes with double quotes
      
      parsedResponse = JSON.parse(jsonStr);
    } else {
      parsedResponse = { answer: aiResponse };
    }
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error.message);
    console.log('Raw response:', aiResponse.substring(0, 500));
    parsedResponse = { answer: aiResponse };
  }

  // Merge sources from web search
  if (sources.length > 0) {
    parsedResponse.sources = [...(parsedResponse.sources || []), ...sources];
  }

  // 9. Save chat messages
  chatHistory.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });

  chatHistory.messages.push({
    role: 'assistant',
    content: parsedResponse.answer || aiResponse,
    timestamp: new Date(),
    usedWebSearch: needsWebSearch,
    sources: parsedResponse.sources || sources,
    chartData: parsedResponse.chart
  });

  await chatHistory.save();

  // 10. Send response
  res.json({
    ok: true,
    sessionId: currentSessionId,
    answer: parsedResponse.answer || aiResponse,
    chart: parsedResponse.chart,
    sources: parsedResponse.sources || sources,
    usedWebSearch: needsWebSearch,
    timestamp: new Date()
  });
});

/**
 * Build comprehensive prompt for Gemini
 */
function buildComprehensivePrompt(userMessage, context, chatHistory) {
  let prompt = `You are Finora, an AI-powered financial analyst and investment advisor.

USER QUESTION: ${userMessage}

`;

  // Add company data
  if (context.companyData) {
    prompt += `
COMPANY DATA (${context.companyData.symbol} - ${context.companyData.name}):
- Market Cap: ${context.companyData.metrics?.marketCap || 'N/A'}
- P/E Ratio: ${context.companyData.metrics?.peRatio || 'N/A'}
- EPS: ${context.companyData.metrics?.eps || 'N/A'}
- Sector: ${context.companyData.metrics?.sector || 'N/A'}
- Revenue: ${context.companyData.metrics?.revenue || 'N/A'}

Analysis Summary: ${context.companyData.analysis?.summary || 'Not available'}
Risk Level: ${context.companyData.analysis?.risk || 'Unknown'}

`;
  }

  // Add portfolio data
  if (context.portfolioData) {
    prompt += `
USER PORTFOLIO:
- Cash Balance: $${context.portfolioData.cashBalance?.toFixed(2) || 0}
- Total Portfolio Value: $${context.portfolioData.totalValue?.toFixed(2) || 0}
- Total Invested: $${context.portfolioData.totalInvested?.toFixed(2) || 0}
- Overall P/L: $${context.portfolioData.profitLoss?.toFixed(2) || 0}
- Risk Tolerance: ${context.portfolioData.riskTolerance || 'Not specified'}
- Investment Goals: ${context.portfolioData.investmentGoals?.join(', ') || 'Not specified'}

Current Holdings:
${context.portfolioData.holdings?.map(h => 
  `  - ${h.symbol}: ${h.quantity} shares @ $${h.currentPrice} (P/L: ${h.profitLossPercentage?.toFixed(2)}%)`
).join('\n') || 'None'}

`;
  }

  // Add documents data
  if (context.documentsData && context.documentsData.length > 0) {
    prompt += `
USER DOCUMENTS:
${context.documentsData.map(doc => `
- ${doc.fileName} (${doc.category}):
  Summary: ${doc.summary || 'N/A'}
  Key Findings: ${doc.keyFindings?.join(', ') || 'N/A'}
`).join('\n')}

`;
  }

  // Add web search results
  if (context.webSearchResults && context.webSearchResults.length > 0) {
    prompt += `
LATEST WEB SEARCH RESULTS:
${context.webSearchResults.map((result, idx) => `
${idx + 1}. ${result.title}
   Source: ${result.source} - ${result.url}
   ${result.snippet}
`).join('\n')}

`;
  }

  // Add chat history
  if (chatHistory && chatHistory.length > 0) {
    prompt += `
RECENT CONVERSATION:
${chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

`;
  }

  prompt += `
INSTRUCTIONS:
1. Provide a comprehensive, intelligent answer based on ALL available data above
2. If you use web search results, cite the sources properly
3. If the question involves financial analysis, provide specific recommendations
4. Consider the user's portfolio and risk tolerance in your advice
5. If appropriate, generate chart data for visualization

Return your response in the following JSON format:
{
  "answer": "Your detailed response here",
  "chart": {
    "type": "line" | "bar" | "pie",
    "title": "Chart title",
    "labels": ["Label1", "Label2"],
    "values": [100, 200]
  },
  "sources": [
    { "name": "Source Name", "url": "https://..." }
  ]
}

If no chart is needed, omit the "chart" field.
If no external sources were used, omit the "sources" field.

RESPOND ONLY WITH THE JSON, NO ADDITIONAL TEXT.
`;

  return prompt;
}

/**
 * GET /api/chat/history/:sessionId
 */
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;
  const chatHistory = await ChatHistory.findOne({ sessionId });

  if (!chatHistory) {
    return next(new AppError('Chat session not found', 404));
  }

  res.json({
    ok: true,
    sessionId,
    symbol: chatHistory.symbol,
    messages: chatHistory.messages,
    createdAt: chatHistory.createdAt
  });
});

/**
 * DELETE /api/chat/history/:sessionId
 */
exports.deleteChatHistory = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;
  const result = await ChatHistory.deleteOne({ sessionId });

  if (result.deletedCount === 0) {
    return next(new AppError('Chat session not found', 404));
  }

  res.json({
    ok: true,
    message: 'Chat history deleted successfully',
    sessionId
  });
});

/**
 * POST /api/chat/new
 */
exports.newChatSession = asyncHandler(async (req, res, next) => {
  const { symbol } = req.body;
  const newSessionId = uuidv4();

  let companyInfo = null;
  if (symbol) {
    const upperSymbol = symbol.toUpperCase();
    const company = await Company.findOne({ symbol: upperSymbol });
    
    if (company) {
      companyInfo = {
        symbol: company.symbol,
        name: company.metrics?.name
      };
    }
  }

  res.json({
    ok: true,
    sessionId: newSessionId,
    symbol: symbol?.toUpperCase() || 'GENERAL',
    companyName: companyInfo?.name,
    message: 'New chat session created'
  });
});

module.exports = exports;
