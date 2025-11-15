import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyService } from '../services/companyService';
import { formatCurrency, formatCompactNumber, formatPercentage } from '../utils/formatters';
import {
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Brain
} from 'lucide-react';
import LineChart from '../components/Charts/LineChart';
import BarChart from '../components/Charts/BarChart';
import AreaChart from '../components/Charts/AreaChart';

const CompanyDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCompanyData();
  }, [symbol]);

  const fetchCompanyData = async () => {
    try {
      const response = await companyService.getCompany(symbol);
      if (response.ok) {
        setCompany(response.data);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      alert('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await companyService.refreshCompany(symbol);
      if (response.ok) {
        setCompany(response.data);
        alert('Company data refreshed successfully!');
      }
    } catch (error) {
      alert('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await companyService.analyzeCompany(symbol);
      if (response.ok) {
        // Refresh to get updated analysis
        await fetchCompanyData();
        alert('Analysis completed successfully!');
      }
    } catch (error) {
      alert('Failed to analyze company');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
          <p className="text-gray-400 mb-6">Unable to load data for {symbol}</p>
          <button
            onClick={() => navigate('/companies')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  const { metrics, chartData, analysis } = company;

  // Prepare chart data
  const priceData = chartData?.slice(-30).map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Price: parseFloat(d.close),
    Volume: d.volume / 1000000 // Convert to millions
  })) || [];

  // Prepare financial data for charts
  const revenueData = metrics?.annualReports?.slice(0, 5).reverse().map(r => ({
    name: r.fiscalDateEnding.substring(0, 4),
    Revenue: parseFloat(r.totalRevenue) / 1000000000, // Convert to billions
    'Net Income': parseFloat(r.netIncome) / 1000000000
  })) || [];

  const balanceSheetData = metrics?.annualBalanceSheet?.slice(0, 5).reverse().map(b => ({
    name: b.fiscalDateEnding.substring(0, 4),
    Assets: parseFloat(b.totalAssets) / 1000000000,
    Liabilities: parseFloat(b.totalLiabilities) / 1000000000,
    Equity: parseFloat(b.totalShareholderEquity) / 1000000000
  })) || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/companies')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold">{symbol}</h1>
              <p className="text-gray-400 mt-1">{metrics?.name || 'Company Details'}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Brain className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} />
              {analyzing ? 'Analyzing...' : 'AI Analysis'}
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-blue-400" size={24} />
              <span className="text-gray-400 text-sm">Market Cap</span>
            </div>
            <p className="text-2xl font-bold">{formatCompactNumber(metrics?.marketCap)}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-green-400" size={24} />
              <span className="text-gray-400 text-sm">P/E Ratio</span>
            </div>
            <p className="text-2xl font-bold">{metrics?.peRatio?.toFixed(2) || 'N/A'}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="text-purple-400" size={24} />
              <span className="text-gray-400 text-sm">EPS</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(metrics?.eps) || 'N/A'}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-yellow-400" size={24} />
              <span className="text-gray-400 text-sm">Revenue</span>
            </div>
            <p className="text-2xl font-bold">{formatCompactNumber(metrics?.revenue) || 'N/A'}</p>
          </div>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-purple-400" size={28} />
              <h2 className="text-2xl font-bold">AI Analysis</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <span className="text-gray-400 text-sm">Risk Level</span>
                <p className={`text-xl font-bold mt-1 ${
                  analysis.risk === 'Low' ? 'text-green-400' :
                  analysis.risk === 'Medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {analysis.risk || 'N/A'}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <span className="text-gray-400 text-sm">Recommendation</span>
                <p className="text-xl font-bold mt-1 text-blue-400">
                  {analysis.suggestion?.substring(0, 50) || 'N/A'}...
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <span className="text-gray-400 text-sm">Analysis Date</span>
                <p className="text-xl font-bold mt-1">
                  {new Date(company.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Summary</h3>
              <p className="text-gray-300 leading-relaxed">{analysis.summary || 'No analysis available'}</p>
            </div>

            {analysis.insights && (
              <div className="mt-4 bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Key Insights</h3>
                <div className="space-y-3">
                  {Object.entries(analysis.insights).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3">
                      <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-gray-400 text-sm">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'financials'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Financials
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'charts'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Charts
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Company Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sector</span>
                  <span className="font-semibold">{metrics?.sector || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Industry</span>
                  <span className="font-semibold">{metrics?.industry || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Market Cap</span>
                  <span className="font-semibold">{formatCompactNumber(metrics?.marketCap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">52 Week High</span>
                  <span className="font-semibold">{formatCurrency(metrics?.fiftyTwoWeekHigh)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">52 Week Low</span>
                  <span className="font-semibold">{formatCurrency(metrics?.fiftyTwoWeekLow)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dividend Yield</span>
                  <span className="font-semibold">{formatPercentage(metrics?.dividendYield)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Valuation Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">P/E Ratio</span>
                  <span className="font-semibold">{metrics?.peRatio?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PEG Ratio</span>
                  <span className="font-semibold">{metrics?.pegRatio?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price to Book</span>
                  <span className="font-semibold">{metrics?.priceToBook?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">EPS</span>
                  <span className="font-semibold">{formatCurrency(metrics?.eps)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Beta</span>
                  <span className="font-semibold">{metrics?.beta?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Margin</span>
                  <span className="font-semibold">{formatPercentage(metrics?.profitMargin)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            {revenueData.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <BarChart
                  data={revenueData}
                  dataKeys={['Revenue', 'Net Income']}
                  colors={['#3b82f6', '#10b981']}
                  title="Revenue & Net Income (in Billions)"
                  height={300}
                />
              </div>
            )}

            {balanceSheetData.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <BarChart
                  data={balanceSheetData}
                  dataKeys={['Assets', 'Liabilities', 'Equity']}
                  colors={['#3b82f6', '#ef4444', '#10b981']}
                  title="Balance Sheet (in Billions)"
                  height={300}
                />
              </div>
            )}

            {(!revenueData.length && !balanceSheetData.length) && (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No financial data available</p>
              </div>
            )}
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            {priceData.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <LineChart
                  data={priceData}
                  dataKeys={['Price']}
                  colors={['#3b82f6']}
                  title={`${symbol} Stock Price (Last 30 Days)`}
                  height={400}
                />
              </div>
            )}

            {priceData.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <AreaChart
                  data={priceData}
                  dataKeys={['Volume']}
                  colors={['#8b5cf6']}
                  title="Trading Volume (in Millions)"
                  height={300}
                />
              </div>
            )}

            {!priceData.length && (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No chart data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail;
