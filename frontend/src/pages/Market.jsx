import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marketService } from '../services/marketService';
import { formatCurrency, formatPercentage, formatCompactNumber, getChangeColor } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import LineChart from '../components/Charts/LineChart';

const Market = () => {
  const [movers, setMovers] = useState(null);
  const [screenerData, setScreenerData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('movers');
  const [selectedFilter, setSelectedFilter] = useState('large');
  const [searchQuery, setSearchQuery] = useState('');
  const [indicatorSymbol, setIndicatorSymbol] = useState('AAPL');
  const [loadingIndicators, setLoadingIndicators] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const moversRes = await marketService.getMovers();
      if (moversRes.ok) {
        setMovers(moversRes.data);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMarketData();
    setRefreshing(false);
  };

  const fetchScreener = async (filter) => {
    try {
      setSelectedFilter(filter);
      const response = await marketService.getScreener(filter);
      if (response.ok) {
        setScreenerData(response.data);
      }
    } catch (error) {
      console.error('Error fetching screener data:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await marketService.searchStocks({ query: searchQuery });
      if (response.ok) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const fetchIndicators = async () => {
    if (!indicatorSymbol.trim()) return;

    setLoadingIndicators(true);
    try {
      const response = await marketService.getAllIndicators(indicatorSymbol);
      if (response.ok) {
        setIndicators(response.data);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
      alert('Failed to fetch indicators. Please try again.');
    } finally {
      setLoadingIndicators(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Market Overview</h1>
            <p className="text-gray-400 mt-2">Real-time market data and analysis</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('movers')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'movers'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Market Movers
            </button>
            <button
              onClick={() => setActiveTab('screener')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'screener'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stock Screener
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Search Stocks
            </button>
            <button
              onClick={() => setActiveTab('indicators')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'indicators'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Technical Indicators
            </button>
          </div>
        </div>

        {/* Market Movers Tab */}
        {activeTab === 'movers' && movers && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Gainers */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-400" size={24} />
                <h2 className="text-xl font-bold">Top Gainers</h2>
              </div>
              <div className="space-y-3">
                {movers.topGainers?.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="block p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{stock.symbol}</span>
                      <span className="text-lg font-semibold">{formatCurrency(stock.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Vol: {formatCompactNumber(stock.volume)}</span>
                      <span className="text-green-400 font-semibold">
                        +{formatPercentage(stock.changePercentage)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="text-red-400" size={24} />
                <h2 className="text-xl font-bold">Top Losers</h2>
              </div>
              <div className="space-y-3">
                {movers.topLosers?.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="block p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{stock.symbol}</span>
                      <span className="text-lg font-semibold">{formatCurrency(stock.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Vol: {formatCompactNumber(stock.volume)}</span>
                      <span className="text-red-400 font-semibold">
                        {formatPercentage(stock.changePercentage)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Most Active */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-blue-400" size={24} />
                <h2 className="text-xl font-bold">Most Active</h2>
              </div>
              <div className="space-y-3">
                {movers.mostActive?.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="block p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{stock.symbol}</span>
                      <span className="text-lg font-semibold">{formatCurrency(stock.price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Vol: {formatCompactNumber(stock.volume)}</span>
                      <span className={`font-semibold ${getChangeColor(stock.changePercentage)}`}>
                        {formatPercentage(stock.changePercentage)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stock Screener Tab */}
        {activeTab === 'screener' && (
          <div>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => fetchScreener('large')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'large'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                <Filter className="inline mr-2" size={16} />
                Large Cap (&gt;$10B)
              </button>
              <button
                onClick={() => fetchScreener('small')}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === 'small'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                <Filter className="inline mr-2" size={16} />
                Small Cap (&lt;$2B)
              </button>
            </div>

            {screenerData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {screenerData.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{stock.symbol}</h3>
                      <span className="text-2xl font-bold">{formatCurrency(stock.price)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Market Cap</span>
                        <span className="font-semibold">{formatCompactNumber(stock.marketCap)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Change</span>
                        <span className={`font-semibold ${getChangeColor(stock.changePercentage)}`}>
                          {formatPercentage(stock.changePercentage)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Volume</span>
                        <span className="font-semibold">{formatCompactNumber(stock.volume)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a filter to view stocks</p>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stocks by symbol, name, or sector..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-colors"
                  >
                    <h3 className="text-xl font-bold mb-2">{stock.symbol}</h3>
                    <p className="text-gray-400 text-sm mb-4">{stock.name}</p>
                    <div className="space-y-2">
                      {stock.sector && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Sector</span>
                          <span className="font-semibold">{stock.sector}</span>
                        </div>
                      )}
                      {stock.marketCap && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Market Cap</span>
                          <span className="font-semibold">{formatCompactNumber(stock.marketCap)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Search for stocks to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Technical Indicators Tab */}
        {activeTab === 'indicators' && (
          <div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={indicatorSymbol}
                  onChange={(e) => setIndicatorSymbol(e.target.value.toUpperCase())}
                  placeholder="Enter symbol (e.g., AAPL)"
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                />
                <button
                  onClick={fetchIndicators}
                  disabled={loadingIndicators}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loadingIndicators ? 'Loading...' : 'Get Indicators'}
                </button>
              </div>
            </div>

            {indicators && (
              <div className="space-y-6">
                {/* SMA Chart */}
                {indicators.sma && (
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <LineChart
                      data={indicators.sma.data.map(d => ({
                        name: new Date(d.date).toLocaleDateString(),
                        SMA: parseFloat(d.sma)
                      }))}
                      dataKeys={['SMA']}
                      colors={['#3b82f6']}
                      title={`Simple Moving Average (SMA) - ${indicatorSymbol}`}
                      height={300}
                    />
                  </div>
                )}

                {/* RSI Chart */}
                {indicators.rsi && (
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Relative Strength Index (RSI) - {indicatorSymbol}
                      </h3>
                      <div className="flex gap-4">
                        <div className="bg-slate-700/50 rounded-lg px-4 py-2">
                          <span className="text-gray-400 text-sm">Current RSI</span>
                          <p className="text-2xl font-bold">{indicators.rsi.currentRSI.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg px-4 py-2">
                          <span className="text-gray-400 text-sm">Signal</span>
                          <p className={`text-xl font-bold ${
                            indicators.rsi.signal === 'OVERBOUGHT' ? 'text-red-400' :
                            indicators.rsi.signal === 'OVERSOLD' ? 'text-green-400' :
                            'text-blue-400'
                          }`}>
                            {indicators.rsi.signal}
                          </p>
                        </div>
                      </div>
                    </div>
                    <LineChart
                      data={indicators.rsi.data.map(d => ({
                        name: new Date(d.date).toLocaleDateString(),
                        RSI: parseFloat(d.rsi)
                      }))}
                      dataKeys={['RSI']}
                      colors={['#10b981']}
                      height={300}
                    />
                  </div>
                )}
              </div>
            )}

            {!indicators && (
              <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Enter a stock symbol to view technical indicators</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
