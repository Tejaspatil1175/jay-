const axios = require('axios');
const alphaVantageService = require('../utils/alphaVantage');
const Company = require('../models/Company');

/**
 * Get top gainers and losers
 * Uses AlphaVantage TOP_GAINERS_LOSERS endpoint
 */
exports.getTopMovers = async (req, res) => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: process.env.ALPHA_VANTAGE_KEY
      },
      timeout: 15000
    });

    if (response.data.Note) {
      return res.status(429).json({
        ok: false,
        error: 'API rate limit exceeded. Please try again later.'
      });
    }

    const { top_gainers, top_losers, most_actively_traded } = response.data;

    res.json({
      ok: true,
      data: {
        topGainers: (top_gainers || []).slice(0, 10).map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercentage: parseFloat(stock.change_percentage.replace('%', '')),
          volume: parseInt(stock.volume)
        })),
        topLosers: (top_losers || []).slice(0, 10).map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercentage: parseFloat(stock.change_percentage.replace('%', '')),
          volume: parseInt(stock.volume)
        })),
        mostActive: (most_actively_traded || []).slice(0, 10).map(stock => ({
          symbol: stock.ticker,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount),
          changePercentage: parseFloat(stock.change_percentage.replace('%', '')),
          volume: parseInt(stock.volume)
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get top movers error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch market movers',
      details: error.message
    });
  }
};

/**
 * Get stocks by market cap filter
 */
exports.getStocksByMarketCap = async (req, res) => {
  try {
    const { filter } = req.query; // 'large' or 'small'

    let query = { 'metrics.marketCap': { $exists: true, $ne: null } };

    if (filter === 'large') {
      // Large cap: > $10 billion
      query['metrics.marketCap'] = { $gte: 10000000000 };
    } else if (filter === 'small') {
      // Small cap: < $2 billion
      query['metrics.marketCap'] = { $lt: 2000000000 };
    }

    const companies = await Company.find(query)
      .select('symbol metrics.name metrics.marketCap metrics.peRatio metrics.sector')
      .sort({ 'metrics.marketCap': -1 })
      .limit(50);

    res.json({
      ok: true,
      filter: filter || 'all',
      count: companies.length,
      data: companies.map(c => ({
        symbol: c.symbol,
        name: c.metrics?.name,
        marketCap: c.metrics?.marketCap,
        peRatio: c.metrics?.peRatio,
        sector: c.metrics?.sector
      }))
    });
  } catch (error) {
    console.error('Get stocks by market cap error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch stocks by market cap',
      details: error.message
    });
  }
};

/**
 * Get SMA (Simple Moving Average) for a symbol
 */
exports.getSMA = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timePeriod = 20, seriesType = 'close' } = req.query;

    console.log('📊 SMA Request:', { symbol, timePeriod, seriesType });

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'SMA',
        symbol: symbol.toUpperCase(),
        interval: 'daily',
        time_period: timePeriod,
        series_type: seriesType,
        apikey: process.env.ALPHA_VANTAGE_KEY
      },
      timeout: 15000
    });

    console.log('📡 Alpha Vantage Response Keys:', Object.keys(response.data));
    console.log('📡 Full Response:', JSON.stringify(response.data, null, 2));

    if (response.data.Note) {
      console.log('⚠️ Rate limit hit');
      return res.status(429).json({
        ok: false,
        error: 'API rate limit exceeded. Please try again later.'
      });
    }

    if (response.data['Error Message']) {
      console.log('❌ Error from API:', response.data['Error Message']);
      return res.status(404).json({
        ok: false,
        error: 'Invalid symbol or no data available'
      });
    }

    const smaData = response.data['Technical Analysis: SMA'];
    
    if (!smaData) {
      console.log('❌ No SMA data in response');
      return res.status(404).json({
        ok: false,
        error: 'No SMA data available for this symbol',
        debug: response.data
      });
    }

    // Convert to array format for charts
    const chartData = Object.entries(smaData)
      .slice(0, 90) // Last 90 days
      .reverse()
      .map(([date, values]) => ({
        date,
        sma: parseFloat(values.SMA)
      }));

    console.log('✅ Returning', chartData.length, 'data points');

    res.json({
      ok: true,
      symbol: symbol.toUpperCase(),
      indicator: 'SMA',
      timePeriod: parseInt(timePeriod),
      data: chartData,
      metadata: response.data['Meta Data']
    });
  } catch (error) {
    console.error('❌ Get SMA error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch SMA data',
      details: error.message
    });
  }
};

/**
 * Get RSI (Relative Strength Index) for a symbol
 */
exports.getRSI = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timePeriod = 14, seriesType = 'close' } = req.query;

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'RSI',
        symbol: symbol.toUpperCase(),
        interval: 'daily',
        time_period: timePeriod,
        series_type: seriesType,
        apikey: process.env.ALPHA_VANTAGE_KEY
      },
      timeout: 15000
    });

    if (response.data.Note) {
      return res.status(429).json({
        ok: false,
        error: 'API rate limit exceeded. Please try again later.'
      });
    }

    if (response.data['Error Message']) {
      return res.status(404).json({
        ok: false,
        error: 'Invalid symbol or no data available'
      });
    }

    const rsiData = response.data['Technical Analysis: RSI'];
    
    if (!rsiData) {
      return res.status(404).json({
        ok: false,
        error: 'No RSI data available for this symbol'
      });
    }

    // Convert to array format for charts
    const chartData = Object.entries(rsiData)
      .slice(0, 90) // Last 90 days
      .reverse()
      .map(([date, values]) => ({
        date,
        rsi: parseFloat(values.RSI)
      }));

    // Determine signal
    const latestRSI = chartData[chartData.length - 1].rsi;
    let signal = 'NEUTRAL';
    if (latestRSI > 70) signal = 'OVERBOUGHT';
    else if (latestRSI < 30) signal = 'OVERSOLD';

    res.json({
      ok: true,
      symbol: symbol.toUpperCase(),
      indicator: 'RSI',
      timePeriod: parseInt(timePeriod),
      currentRSI: latestRSI,
      signal,
      data: chartData,
      metadata: response.data['Meta Data']
    });
  } catch (error) {
    console.error('Get RSI error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch RSI data',
      details: error.message
    });
  }
};

/**
 * Get all technical indicators for a symbol
 */
exports.getAllIndicators = async (req, res) => {
  try {
    const { symbol } = req.params;

    const [smaResponse, rsiResponse] = await Promise.allSettled([
      axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'SMA',
          symbol: symbol.toUpperCase(),
          interval: 'daily',
          time_period: 20,
          series_type: 'close',
          apikey: process.env.ALPHA_VANTAGE_KEY
        }
      }),
      axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'RSI',
          symbol: symbol.toUpperCase(),
          interval: 'daily',
          time_period: 14,
          series_type: 'close',
          apikey: process.env.ALPHA_VANTAGE_KEY
        }
      })
    ]);

    const indicators = {};

    if (smaResponse.status === 'fulfilled' && smaResponse.value.data['Technical Analysis: SMA']) {
      const smaData = smaResponse.value.data['Technical Analysis: SMA'];
      const latestSMA = Object.values(smaData)[0];
      indicators.sma = {
        value: parseFloat(latestSMA.SMA),
        period: 20
      };
    }

    if (rsiResponse.status === 'fulfilled' && rsiResponse.value.data['Technical Analysis: RSI']) {
      const rsiData = rsiResponse.value.data['Technical Analysis: RSI'];
      const latestRSI = parseFloat(Object.values(rsiData)[0].RSI);
      indicators.rsi = {
        value: latestRSI,
        period: 14,
        signal: latestRSI > 70 ? 'OVERBOUGHT' : latestRSI < 30 ? 'OVERSOLD' : 'NEUTRAL'
      };
    }

    res.json({
      ok: true,
      symbol: symbol.toUpperCase(),
      indicators,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get all indicators error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch technical indicators',
      details: error.message
    });
  }
};

/**
 * Search stocks by criteria
 */
exports.searchStocks = async (req, res) => {
  try {
    const { query, sector, minMarketCap, maxMarketCap } = req.query;

    let filter = {};

    if (query) {
      filter.$or = [
        { symbol: { $regex: query, $options: 'i' } },
        { 'metrics.name': { $regex: query, $options: 'i' } }
      ];
    }

    if (sector) {
      filter['metrics.sector'] = sector;
    }

    if (minMarketCap) {
      filter['metrics.marketCap'] = { ...filter['metrics.marketCap'], $gte: parseFloat(minMarketCap) };
    }

    if (maxMarketCap) {
      filter['metrics.marketCap'] = { ...filter['metrics.marketCap'], $lte: parseFloat(maxMarketCap) };
    }

    const companies = await Company.find(filter)
      .select('symbol metrics.name metrics.marketCap metrics.sector metrics.peRatio')
      .limit(50);

    res.json({
      ok: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    console.error('Search stocks error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to search stocks',
      details: error.message
    });
  }
};

module.exports = exports;
