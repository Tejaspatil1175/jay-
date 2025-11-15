const Company = require('../models/Company');
const ChatHistory = require('../models/ChatHistory');
const geminiService = require('../utils/gemini');
const webSearchService = require('../utils/webSearch');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/chat
 * Smart chatbot with context awareness and web search
 */
exports.chat = asyncHandler(async (req, res, next) => {
  const { message, symbol, sessionId } = req.body;

  if (!message) {
    return next(new AppError('Message is required', 400));
  }

  if (!symbol) {
    return next(new AppError('Company symbol is required', 400));
  }

  const upperSymbol = symbol.toUpperCase();

  // Get company data
  const company = await Company.findOne({ symbol: upperSymbol });

  if (!company) {
    return next(new AppError('Company data not found. Fetch company data first.', 404));
  }

  // Get or create session
  const currentSessionId = sessionId || uuidv4();
  let chatHistory = await ChatHistory.findOne({ sessionId: currentSessionId });

  if (!chatHistory) {
    chatHistory = new ChatHistory({
      sessionId: currentSessionId,
      symbol: upperSymbol,
      messages: []
    });
  }

  // Get recent chat history (last 10 messages)
  const recentHistory = chatHistory.messages.slice(-10);

  // Prepare company context
  const companyContext = {
    symbol: company.symbol,
    name: company.metrics.name,
    metrics: company.metrics,
    analysis: company.analysis
  };

  // Determine if web search is needed
  console.log(`🤔 Checking if web search needed for: "${message}"`);
  const needsWebSearch = await geminiService.shouldUseWebSearch(message, companyContext);

  let webSearchResults = null;
  let sources = [];

  if (needsWebSearch) {
    console.log(`🔍 Performing web search for: "${message}"`);
    
    // Perform web search
    const searchQuery = `${company.metrics.name} ${upperSymbol} ${message}`;
    const results = await webSearchService.search(searchQuery, 5);
    
    if (results && results.length > 0) {
      webSearchResults = webSearchService.formatResultsForAI(results);
      sources = results.map(r => r.url);
    }
  }

  // Generate AI response
  console.log(`🤖 Generating response...`);
  const aiResponse = await geminiService.chatWithContext(
    message,
    companyContext,
    recentHistory,
    webSearchResults
  );

  // Save user message
  chatHistory.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  });

  // Save assistant response
  chatHistory.messages.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date(),
    usedWebSearch: needsWebSearch,
    sources
  });

  await chatHistory.save();

  res.json({
    ok: true,
    sessionId: currentSessionId,
    message: aiResponse,
    usedWebSearch: needsWebSearch,
    sources: sources.length > 0 ? sources : undefined,
    timestamp: new Date()
  });
});

/**
 * GET /api/chat/history/:sessionId
 * Get chat history
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
 * Delete chat history
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
 * Start new chat session
 */
exports.newChatSession = asyncHandler(async (req, res, next) => {
  const { symbol } = req.body;

  if (!symbol) {
    return next(new AppError('Company symbol is required', 400));
  }

  const upperSymbol = symbol.toUpperCase();

  // Verify company exists
  const company = await Company.findOne({ symbol: upperSymbol });

  if (!company) {
    return next(new AppError('Company data not found. Fetch company data first.', 404));
  }

  const newSessionId = uuidv4();

  res.json({
    ok: true,
    sessionId: newSessionId,
    symbol: upperSymbol,
    companyName: company.metrics.name,
    message: 'New chat session created'
  });
});
