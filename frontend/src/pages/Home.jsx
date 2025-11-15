import { Link, Navigate } from 'react-router-dom';
import { TrendingUp, BarChart3, Brain, Shield, Wallet, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: BarChart3,
      title: 'Real-Time Market Data',
      description: 'Access live stock prices, market movers, and technical indicators powered by AlphaVantage API.',
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Get intelligent insights and recommendations from Gemini AI for smarter investment decisions.',
    },
    {
      icon: Wallet,
      title: 'Portfolio Management',
      description: 'Track your investments, manage holdings, and execute paper trades with real-time P&L calculations.',
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Upload bank statements, reports, and financial documents for AI-powered analysis and insights.',
    },
    {
      icon: MessageSquare,
      title: 'Intelligent Chatbot',
      description: 'Ask questions and get context-aware responses using your portfolio, documents, and live web data.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with JWT authentication and secure API communications.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Finora</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            AI-Powered Financial
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Analysis Platform
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Make smarter investment decisions with real-time market data, intelligent AI analysis,
            and comprehensive portfolio management tools.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need for smart investing
            </h2>
            <p className="text-lg text-gray-300">
              Powerful features designed to help you make informed financial decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 hover:border-blue-500/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">Real-Time</div>
                <p className="text-gray-300">Market Data Updates</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">AI-Powered</div>
                <p className="text-gray-300">Investment Insights</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">Multi-Source</div>
                <p className="text-gray-300">Data Integration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start your investment journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of investors making smarter decisions with Finora
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-xl py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">© 2024 Finora. All rights reserved.</p>
            <p className="text-sm">Built with ❤️ by Team Certified Losers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
