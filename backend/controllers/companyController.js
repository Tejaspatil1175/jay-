const Company = require('../models/Company');
const alphaVantageService = require('../utils/alphaVantage');
const dataTransformer = require('../utils/dataTransformer');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/company/:symbol
 * Fetch company data, store in DB, return to frontend
 */
exports.getCompanyData = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!symbol) {
    return next(new AppError('Company symbol is required', 400));
  }

  // Check if data exists and is recent (within 24 hours)
  const existingCompany = await Company.findOne({ symbol });
  const isDataFresh = existingCompany && 
    (Date.now() - new Date(existingCompany.fetchedAt).getTime()) < 24 * 60 * 60 * 1000;

  if (isDataFresh && existingCompany.analysis) {
    // Return cached data
    return res.json({
      ok: true,
      message: 'Data retrieved from cache',
      cached: true,
      company: symbol,
      data: {
        symbol: existingCompany.symbol,
        name: existingCompany.metrics.name,
        metrics: existingCompany.metrics,
        chartData: existingCompany.chartData,
        historicalTrends: existingCompany.raw.historicalTrends,
        analysis: existingCompany.analysis,
        fetchedAt: existingCompany.fetchedAt
      }
    });
  }

  // Fetch fresh data from AlphaVantage
  console.log(`📊 Fetching fresh data for ${symbol}...`);
  
  const rawData = await alphaVantageService.fetchAllData(symbol);

  // Normalize metrics
  const metrics = dataTransformer.normalizeMetrics(
    rawData.overview,
    rawData.incomeStatement,
    rawData.balanceSheet,
    rawData.cashFlow
  );

  // Calculate derived metrics
  const enrichedMetrics = dataTransformer.calculateDerivedMetrics(metrics);

  // Transform chart data
  const chartData = dataTransformer.transformChartData(rawData.timeSeries);

  // Create historical trends
  const historicalTrends = dataTransformer.createHistoricalTrends(
    rawData.incomeStatement,
    rawData.balanceSheet
  );

  // Prepare company document
  const companyData = {
    symbol,
    providerUsed: 'alphavantage',
    fetchedAt: new Date(),
    raw: {
      overview: rawData.overview,
      incomeStatement: rawData.incomeStatement,
      balanceSheet: rawData.balanceSheet,
      cashFlow: rawData.cashFlow,
      historicalTrends
    },
    metrics: enrichedMetrics,
    chartData,
    access: {
      userId: req.headers['user-id'] || 'anonymous',
      visibility: 'public'
    }
  };

  // Save or update in database
  const savedCompany = await Company.findOneAndUpdate(
    { symbol },
    companyData,
    { upsert: true, new: true, runValidators: true }
  );

  res.json({
    ok: true,
    message: 'Company data fetched successfully',
    cached: false,
    company: symbol,
    data: {
      symbol: savedCompany.symbol,
      name: savedCompany.metrics.name,
      metrics: savedCompany.metrics,
      chartData: savedCompany.chartData,
      historicalTrends: savedCompany.raw.historicalTrends,
      fetchedAt: savedCompany.fetchedAt
    }
  });
});

/**
 * GET /api/company/:symbol/refresh
 * Force refresh company data
 */
exports.refreshCompanyData = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();

  // Delete existing data
  await Company.deleteOne({ symbol });

  // Fetch fresh data
  req.params.symbol = symbol;
  return exports.getCompanyData(req, res, next);
});

/**
 * GET /api/companies
 * Get all stored companies
 */
exports.getAllCompanies = asyncHandler(async (req, res, next) => {
  const companies = await Company.find()
    .select('symbol metrics.name metrics.sector fetchedAt')
    .sort({ fetchedAt: -1 })
    .limit(100);

  res.json({
    ok: true,
    count: companies.length,
    companies
  });
});
