import { useState } from 'react';
import { companyService } from '../services/companyService';
import { formatCurrency, formatCompactNumber, formatPercentage } from '../utils/formatters';
import {
  Search,
  Brain,
  Loader,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target
} from 'lucide-react';
import LineChart from '../components/Charts/LineChart';
import BarChart from '../components/Charts/BarChart';

const Analysis = () => {
  const [symbol, setSymbol] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    try {
      const response = await companyService.analyzeCompany(symbol.toUpperCase());
      if (response.ok) {
        setAnalysis(response);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to analyze company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">AI Stock Analysis</h1>
          <p className="text-gray-400 mt-2">Get comprehensive AI-powered analysis of any stock</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleAnalyze} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL, GOOGL, TSLA)"
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !symbol.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain size={20} />
                  Analyze Stock
                </>
              )}
            </button>
          </div>
        </form>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-8 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{analysis.symbol}</h2>
                  <p className="text-gray-400">AI Analysis Report</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {analysis.analysis?.summary || 'No summary available'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="text-blue-400" size={20} />
                    <span className="text-gray-400 text-sm">Risk Level</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    analysis.analysis?.risk === 'Low' ? 'text-green-400' :
                    analysis.analysis?.risk === 'Medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {analysis.analysis?.risk || 'N/A'}
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-green-400" size={20} />
                    <span className="text-gray-400 text-sm">Recommendation</span>
                  </div>
                  <p className="text-lg font-semibold text-blue-400">
                    {analysis.analysis?.suggestion || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            {analysis.analysis?.insights && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="text-2xl font-bold">Key Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(analysis.analysis.insights).map(([key, value]) => (
                    <div key={key} className="bg-slate-700/30 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2 capitalize text-blue-400">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-gray-300">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-slate-800 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="text-xl font-bold text-green-400">Strengths</h3>
                </div>
                <div className="space-y-3">
                  {[
                    'Strong market position',
                    'Consistent revenue growth',
                    'Healthy profit margins',
                    'Good dividend yield'
                  ].map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="text-green-400" size={14} />
                      </div>
                      <p className="text-gray-300">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div className="bg-slate-800 rounded-xl p-6 border border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-red-400" size={24} />
                  <h3 className="text-xl font-bold text-red-400">Risks & Challenges</h3>
                </div>
                <div className="space-y-3">
                  {[
                    'Market volatility exposure',
                    'Competitive pressures',
                    'Regulatory challenges',
                    'Economic headwinds'
                  ].map((risk, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="text-red-400" size={14} />
                      </div>
                      <p className="text-gray-300">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Analysis */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-2xl font-bold mb-6">Performance Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <LineChart
                    data={[
                      { name: 'Q1', value: 100 },
                      { name: 'Q2', value: 120 },
                      { name: 'Q3', value: 135 },
                      { name: 'Q4', value: 150 }
                    ]}
                    dataKeys={['value']}
                    colors={['#3b82f6']}
                    title="Revenue Growth Trend"
                    height={250}
                  />
                </div>
                <div>
                  <BarChart
                    data={[
                      { name: '2021', value: 80 },
                      { name: '2022', value: 95 },
                      { name: '2023', value: 110 },
                      { name: '2024', value: 125 }
                    ]}
                    dataKeys={['value']}
                    colors={['#10b981']}
                    title="Earnings Per Share"
                    height={250}
                  />
                </div>
              </div>
            </div>

            {/* Investment Recommendation */}
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-purple-400" size={24} />
                <h3 className="text-2xl font-bold">Investment Recommendation</h3>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed text-lg mb-4">
                  {analysis.analysis?.suggestion || 'No specific recommendation available at this time.'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>⚠️ This is an AI-generated analysis for informational purposes only.</span>
                  <span>📊 Always conduct your own research before investing.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <BarChart3 className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-3">Get Started with AI Analysis</h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              Enter a stock symbol above to receive a comprehensive AI-powered analysis including financial metrics,
              risk assessment, and investment recommendations.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-blue-400" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-green-400" />
                <span>Visual Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                <span>Risk Assessment</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
