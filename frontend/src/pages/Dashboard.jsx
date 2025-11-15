import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { portfolioService } from '../services/portfolioService';
import { marketService } from '../services/marketService';
import {
  formatCurrency,
  formatPercentage,
  getChangeColor,
  formatCompactNumber,
} from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

const Dashboard = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketMovers, setMarketMovers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, moversRes] = await Promise.all([
        portfolioService.getSummary(),
        marketService.getMovers(),
      ]);

      if (portfolioRes.ok) {
        setPortfolioData(portfolioRes.data);
      }

      if (moversRes.ok) {
        setMarketMovers(moversRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const portfolio = portfolioData?.portfolio || {};

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's your portfolio overview</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cash Balance */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Cash Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(portfolio.cashBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Invested */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Invested</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(portfolio.totalInvested)}
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Portfolio Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(portfolio.totalValue)}
                </p>
              </div>
            </div>
          </div>

          {/* Profit/Loss */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  portfolio.profitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                {portfolio.profitLoss >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Profit/Loss</p>
                <p className={`text-2xl font-bold ${getChangeColor(portfolio.profitLoss)}`}>
                  {formatCurrency(portfolio.profitLoss)}
                </p>
                <p className={`text-sm ${getChangeColor(portfolio.profitLossPercentage)}`}>
                  {formatPercentage(portfolio.profitLossPercentage)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Preview */}
        {portfolioData?.holdings && portfolioData.holdings.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Holdings</h2>
              <Link
                to="/portfolio"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {portfolioData.holdings.slice(0, 5).map((holding) => (
                <div
                  key={holding.symbol}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-400">
                        {holding.symbol}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{holding.symbol}</p>
                      <p className="text-sm text-gray-400">
                        {holding.quantity} shares @ {formatCurrency(holding.currentPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {formatCurrency(holding.currentValue)}
                    </p>
                    <p className={`text-sm ${getChangeColor(holding.profitLoss)}`}>
                      {formatPercentage(holding.profitLossPercentage)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Movers */}
        {marketMovers && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Gainers */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-bold text-white">Top Gainers</h2>
              </div>
              <div className="space-y-3">
                {marketMovers.topGainers?.slice(0, 5).map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="block p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{stock.symbol}</p>
                        <p className="text-sm text-gray-400">
                          Vol: {formatCompactNumber(stock.volume)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatCurrency(stock.price)}
                        </p>
                        <p className="text-sm text-green-400">
                          +{formatPercentage(stock.changePercentage)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-bold text-white">Top Losers</h2>
              </div>
              <div className="space-y-3">
                {marketMovers.topLosers?.slice(0, 5).map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="block p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{stock.symbol}</p>
                        <p className="text-sm text-gray-400">
                          Vol: {formatCompactNumber(stock.volume)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatCurrency(stock.price)}
                        </p>
                        <p className="text-sm text-red-400">
                          {formatPercentage(stock.changePercentage)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Most Active */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Most Active</h2>
              </div>
              <div className="space-y-3">
                {marketMovers.mostActive?.slice(0, 5).map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/companies/${stock.symbol}`}
                    className="block p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{stock.symbol}</p>
                        <p className="text-sm text-gray-400">
                          Vol: {formatCompactNumber(stock.volume)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {formatCurrency(stock.price)}
                        </p>
                        <p className={`text-sm ${getChangeColor(stock.changePercentage)}`}>
                          {formatPercentage(stock.changePercentage)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
