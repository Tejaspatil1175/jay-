import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import {
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  ExternalLink,
  TrendingUp,
  Brain,
  RefreshCw
} from 'lucide-react';
import LineChart from '../components/Charts/LineChart';
import BarChart from '../components/Charts/BarChart';
import PieChart from '../components/Charts/PieChart';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const response = await chatService.startNewChat();
      if (response.ok && response.sessionId) {
        setSessionId(response.sessionId);
        setMessages([
          {
            role: 'assistant',
            content: '👋 Hello! I\'m your AI financial advisor. I can help you with:\n\n' +
              '• **Stock Analysis** - Get insights on any company\n' +
              '• **Portfolio Review** - Analyze your current investments\n' +
              '• **Market Trends** - Stay updated with latest market moves\n' +
              '• **Document Analysis** - Understand your financial documents\n' +
              '• **Investment Advice** - Get personalized recommendations\n\n' +
              'Feel free to ask me anything about finance and investing!',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        message: input,
        symbol: symbol || undefined,
        sessionId: sessionId || undefined
      });

      if (response.ok) {
        const assistantMessage = {
          role: 'assistant',
          content: response.answer,
          chart: response.chart,
          sources: response.sources,
          usedWebSearch: response.usedWebSearch,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        if (response.sessionId && !sessionId) {
          setSessionId(response.sessionId);
        }
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    if (confirm('Start a new chat? Current conversation will be lost.')) {
      setMessages([]);
      setSessionId(null);
      initializeChat();
    }
  };

  const renderChart = (chart) => {
    if (!chart || !chart.labels || !chart.values) return null;

    const chartData = chart.labels.map((label, i) => ({
      name: label,
      [chart.title || 'Value']: chart.values[i]
    }));

    switch (chart.type) {
      case 'line':
        return (
          <div className="my-4">
            <LineChart
              data={chartData}
              dataKeys={[chart.title || 'Value']}
              colors={['#3b82f6']}
              title={chart.title}
              height={250}
            />
          </div>
        );
      case 'bar':
        return (
          <div className="my-4">
            <BarChart
              data={chartData}
              dataKeys={[chart.title || 'Value']}
              colors={['#10b981']}
              title={chart.title}
              height={250}
            />
          </div>
        );
      case 'pie':
        return (
          <div className="my-4">
            <PieChart
              data={chart.labels.map((label, i) => ({
                name: label,
                value: chart.values[i]
              }))}
              title={chart.title}
              height={250}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const formatMessage = (content) => {
    // Format the message with proper markdown support
    return content;
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Initializing AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Financial Advisor</h1>
              <p className="text-sm text-gray-400">Powered by Gemini AI + Multi-Source Intelligence</p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-3xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                    : message.isError
                    ? 'bg-red-900/30 border border-red-500/30 rounded-2xl rounded-tl-sm'
                    : 'bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm'
                } px-6 py-4`}
              >
                {/* Message Content */}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-blue-400" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code className="bg-slate-700 px-2 py-1 rounded text-sm" {...props} />
                        ) : (
                          <code className="block bg-slate-700 p-4 rounded-lg my-3 overflow-x-auto" {...props} />
                        ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic my-3" {...props} />
                      ),
                    }}
                  >
                    {formatMessage(message.content)}
                  </ReactMarkdown>
                </div>

                {/* Chart */}
                {message.chart && renderChart(message.chart)}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <ExternalLink className="text-blue-400" size={16} />
                      <span className="text-sm font-semibold text-blue-400">Sources:</span>
                    </div>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <span className="w-5 h-5 bg-slate-700 rounded flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          {source.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Web Search Indicator */}
                {message.usedWebSearch && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span>Used live web search for up-to-date information</span>
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-3 text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-6 py-4">
                <div className="flex items-center gap-3">
                  <Loader className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-gray-400">Analyzing your question...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (optional)"
              className="w-32 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stocks, portfolio, market trends..."
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send
                </>
              )}
            </button>
          </form>

          {/* Info Text */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp size={14} />
            <span>
              AI analyzes company data, your portfolio, documents, and live web sources for comprehensive insights
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
