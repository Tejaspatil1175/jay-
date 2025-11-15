const Company = require('../models/Company');
const geminiService = require('../utils/gemini');
const { AppError, asyncHandler } = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');
const companyController = require('./companyController');

/**
 * POST /api/analyze/:symbol
 * Analyze company using Gemini AI and store analysis
 */
exports.analyzeCompany = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();

  if (!symbol) {
    return next(new AppError('Company symbol is required', 400));
  }

  // Check if company data exists
  let company = await Company.findOne({ symbol });

  // If company doesn't exist or data is old (>24 hours), fetch fresh data
  const isDataOld = !company || 
    (Date.now() - new Date(company.fetchedAt).getTime()) > 24 * 60 * 60 * 1000;

  if (!company || isDataOld) {
    console.log(`📊 Fetching company data for ${symbol}...`);
    
    // Use company controller to fetch data
    try {
      await new Promise((resolve, reject) => {
        const mockRes = {
          json: (data) => {
            if (data.ok) {
              resolve(data);
            } else {
              reject(new Error(data.error || 'Failed to fetch company data'));
            }
          }
        };
        
        companyController.getCompanyData(req, mockRes, (err) => {
          if (err) reject(err);
        });
      });
      
      // Fetch the company again after getting data
      company = await Company.findOne({ symbol });
      
      if (!company) {
        return next(new AppError('Failed to fetch company data', 500));
      }
    } catch (error) {
      return next(new AppError(error.message || 'Failed to fetch company data', 500));
    }
  }

  // Check if analysis exists and is recent (within 7 days)
  const isAnalysisFresh = company.analysis && company.analysis.createdAt &&
    (Date.now() - new Date(company.analysis.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  if (isAnalysisFresh) {
    return res.json({
      ok: true,
      message: 'Analysis retrieved from cache',
      cached: true,
      symbol,
      data: {
        symbol: company.symbol,
        name: company.metrics.name,
        metrics: company.metrics,
        chartData: company.chartData,
        analysis: company.analysis,
        fetchedAt: company.fetchedAt
      }
    });
  }

  // Generate fresh analysis using Gemini
  console.log(`🤖 Generating AI analysis for ${symbol}...`);

  const analysis = await geminiService.analyzeFinancials(company.metrics);

  // Add analysis ID and timestamp
  analysis.analysisId = uuidv4();
  analysis.createdAt = new Date();

  // Update company with analysis
  company.analysis = analysis;
  await company.save();

  res.json({
    ok: true,
    message: 'Analysis generated successfully',
    cached: false,
    symbol,
    data: {
      symbol: company.symbol,
      name: company.metrics.name,
      metrics: company.metrics,
      chartData: company.chartData,
      analysis: company.analysis,
      fetchedAt: company.fetchedAt
    }
  });
});

/**
 * GET /api/analyze/:symbol
 * Get existing analysis
 */
exports.getAnalysis = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();

  const company = await Company.findOne({ symbol }).select('symbol metrics.name analysis');

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  if (!company.analysis) {
    return next(new AppError('No analysis found. Generate analysis first.', 404));
  }

  res.json({
    ok: true,
    symbol,
    name: company.metrics.name,
    analysis: company.analysis
  });
});

/**
 * DELETE /api/analyze/:symbol
 * Delete analysis (force regeneration)
 */
exports.deleteAnalysis = asyncHandler(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();

  const company = await Company.findOne({ symbol });

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  company.analysis = undefined;
  await company.save();

  res.json({
    ok: true,
    message: 'Analysis deleted successfully',
    symbol
  });
});
