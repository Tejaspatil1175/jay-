import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyService } from '../services/companyService';
import { formatCurrency, formatCompactNumber } from '../utils/formatters';
import { Search, RefreshCw, Building2, TrendingUp, ExternalLink } from 'lucide-react';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await companyService.getAllCompanies();
      if (response.ok) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCompanies();
    setRefreshing(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setSearchQuery('');
      return;
    }
    setSearchQuery(searchInput.toUpperCase());
  };

  const handleAddCompany = async () => {
    const symbol = prompt('Enter company symbol (e.g., GOOGL):');
    if (!symbol) return;

    try {
      setLoading(true);
      const response = await companyService.getCompany(symbol.toUpperCase());
      if (response.ok) {
        alert(`${symbol.toUpperCase()} added successfully!`);
        await fetchCompanies();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = searchQuery
    ? companies.filter(c => c.symbol.includes(searchQuery) || c.metrics?.name?.toUpperCase().includes(searchQuery))
    : companies;

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
            <h1 className="text-4xl font-bold">Companies</h1>
            <p className="text-gray-400 mt-2">Browse and analyze company fundamentals</p>
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
              onClick={handleAddCompany}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Building2 size={20} />
              Add Company
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by symbol or company name..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchInput('');
                }}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company.symbol}
                to={`/companies/${company.symbol}`}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-400">{company.symbol}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                      {company.metrics?.name || 'Unknown Company'}
                    </p>
                  </div>
                  <ExternalLink className="text-gray-400" size={20} />
                </div>

                <div className="space-y-3">
                  {company.metrics?.marketCap && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Market Cap</span>
                      <span className="font-semibold">
                        {formatCompactNumber(company.metrics.marketCap)}
                      </span>
                    </div>
                  )}

                  {company.metrics?.peRatio && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">P/E Ratio</span>
                      <span className="font-semibold">{company.metrics.peRatio.toFixed(2)}</span>
                    </div>
                  )}

                  {company.metrics?.eps && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">EPS</span>
                      <span className="font-semibold">{formatCurrency(company.metrics.eps)}</span>
                    </div>
                  )}

                  {company.metrics?.revenue && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Revenue</span>
                      <span className="font-semibold">
                        {formatCompactNumber(company.metrics.revenue)}
                      </span>
                    </div>
                  )}

                  {company.analysis?.risk && (
                    <div className="mt-4 pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Risk Level</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          company.analysis.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
                          company.analysis.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {company.analysis.risk}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-medium">
                  <TrendingUp size={16} />
                  View Details
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {searchQuery ? 'No companies found' : 'No companies added yet'}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Click "Add Company" to start tracking companies'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddCompany}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Building2 size={20} />
                Add Your First Company
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
