import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { formatCurrency, formatPercentage, getChangeColor } from '../utils/formatters';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Activity,
  RefreshCw,
  Plus,
  Minus,
  DollarSign,
  BarChart3,
  Clock
} from 'lucide-react';
import PieChart from '../components/Charts/PieChart';
import LineChart from '../components/Charts/LineChart';
import BarChart from '../components/Charts/BarChart';

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('holdings');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [orderForm, setOrderForm] = useState({ symbol: '', quantity: 0, price: 0 });
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [summaryRes, holdingsRes, ordersRes, positionsRes] = await Promise.all([
        portfolioService.getSummary(),
        portfolioService.getHoldings(),
        portfolioService.getOrders(),
        portfolioService.getPositions()
      ]);

      if (summaryRes.ok) setPortfolioData(summaryRes.data);
      if (holdingsRes.ok) setHoldings(holdingsRes.data);
      if (ordersRes.ok) setOrders(ordersRes.data);
      if (positionsRes.ok) setPositions(positionsRes.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await portfolioService.updatePrices();
    await fetchPortfolioData();
    setRefreshing(false);
  };

  const handleBuyOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      const response = await portfolioService.buyStock(orderForm);
      if (response.ok) {
        alert('Buy order executed successfully!');
        setShowBuyModal(false);
        setOrderForm({ symbol: '', quantity: 0, price: 0 });
        fetchPortfolioData();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to execute buy order');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSellOrder = async (e) => {
    e.preventDefault();
    setOrderLoading(true);
    try {
      const response = await portfolioService.sellStock(orderForm);
      if (response.ok) {
        alert('Sell order executed successfully!');
        setShowSellModal(false);
        setOrderForm({ symbol: '', quantity: 0, price: 0 });
        fetchPortfolioData();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to execute sell order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const portfolio = portfolioData?.portfolio || {};
  
  // Prepare chart data
  const allocationData = holdings.map(h => ({
    name: h.symbol,
    value: h.currentValue || 0
  }));

  const performanceData = holdings.map(h => ({
    name: h.symbol,
    profitLoss: h.profitLoss || 0,
    percentage: h.profitLossPercentage || 0
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold">Portfolio</h1>
              <p className="text-gray-400 mt-1">Manage your investments</p>
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
              onClick={() => setShowBuyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Buy Stock
            </button>
            <button
              onClick={() => setShowSellModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Minus size={20} />
              Sell Stock
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="text-blue-400" size={24} />
              <span className="text-gray-400 text-sm">Cash Balance</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(portfolio.cashBalance)}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-purple-400" size={24} />
              <span className="text-gray-400 text-sm">Total Invested</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(portfolio.totalInvested)}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-green-400" size={24} />
              <span className="text-gray-400 text-sm">Portfolio Value</span>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={portfolio.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'} size={24} />
              <span className="text-gray-400 text-sm">Total P&L</span>
            </div>
            <p className={`text-3xl font-bold ${getChangeColor(portfolio.profitLoss)}`}>
              {formatCurrency(portfolio.profitLoss)}
            </p>
            <p className={`text-sm ${getChangeColor(portfolio.profitLossPercentage)}`}>
              {formatPercentage(portfolio.profitLossPercentage)}
            </p>
          </div>
        </div>

        {/* Charts */}
        {holdings.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <PieChart 
                data={allocationData} 
                title="Portfolio Allocation" 
                height={300}
              />
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <BarChart
                data={performanceData}
                dataKeys={['profitLoss']}
                colors={['#10b981']}
                title="Holdings Performance"
                height={300}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'holdings'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Holdings ({holdings.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'positions'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Positions ({positions.length})
            </button>
          </div>
        </div>

        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {holdings.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No holdings yet</p>
                <p className="text-gray-500 text-sm mt-2">Start buying stocks to build your portfolio</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Symbol</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Avg Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Current Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Current Value</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">P&L</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">P&L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => (
                      <tr key={holding.symbol} className="border-t border-slate-700 hover:bg-slate-700/30">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-400">{holding.symbol}</span>
                        </td>
                        <td className="px-6 py-4 text-right">{holding.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(holding.averagePrice)}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(holding.currentPrice)}</td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {formatCurrency(holding.currentValue)}
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${getChangeColor(holding.profitLoss)}`}>
                          {formatCurrency(holding.profitLoss)}
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${getChangeColor(holding.profitLossPercentage)}`}>
                          {formatPercentage(holding.profitLossPercentage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Symbol</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderId} className="border-t border-slate-700 hover:bg-slate-700/30">
                        <td className="px-6 py-4 text-sm text-gray-400">{order.orderId}</td>
                        <td className="px-6 py-4 font-semibold text-blue-400">{order.symbol}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.orderType === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {order.orderType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">{order.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(order.price)}</td>
                        <td className="px-6 py-4 text-right font-semibold">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.orderStatus === 'EXECUTED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(order.executedAt || order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Positions Tab */}
        {activeTab === 'positions' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {positions.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No positions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Symbol</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Entry Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">Current Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">P&L</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Opened</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((position) => (
                      <tr key={position._id} className="border-t border-slate-700 hover:bg-slate-700/30">
                        <td className="px-6 py-4 font-semibold text-blue-400">{position.symbol}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            position.positionStatus === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {position.positionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">{formatCurrency(position.entryPrice)}</td>
                        <td className="px-6 py-4 text-right">{position.quantity}</td>
                        <td className="px-6 py-4 text-right">{formatCurrency(position.currentPrice)}</td>
                        <td className={`px-6 py-4 text-right font-semibold ${getChangeColor(position.unrealizedProfitLoss)}`}>
                          {formatCurrency(position.unrealizedProfitLoss)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(position.openedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Buy Stock</h2>
            <form onSubmit={handleBuyOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Symbol</label>
                <input
                  type="text"
                  value={orderForm.symbol}
                  onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="AAPL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                <input
                  type="number"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price per Share</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  min="0.01"
                  required
                />
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(orderForm.quantity * orderForm.price)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {orderLoading ? 'Executing...' : 'Buy Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Sell Stock</h2>
            <form onSubmit={handleSellOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Symbol</label>
                <input
                  type="text"
                  value={orderForm.symbol}
                  onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="AAPL"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                <input
                  type="number"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price per Share</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  min="0.01"
                  required
                />
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(orderForm.quantity * orderForm.price)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {orderLoading ? 'Executing...' : 'Sell Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
