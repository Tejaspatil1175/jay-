const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

/**
 * @route   POST /api/analyze/:symbol
 * @desc    Generate AI analysis for company
 * @access  Public
 */
router.post('/:symbol', analysisController.analyzeCompany);

/**
 * @route   GET /api/analyze/:symbol
 * @desc    Get existing analysis
 * @access  Public
 */
router.get('/:symbol', analysisController.getAnalysis);

/**
 * @route   DELETE /api/analyze/:symbol
 * @desc    Delete analysis (force regeneration)
 * @access  Public
 */
router.delete('/:symbol', analysisController.deleteAnalysis);

module.exports = router;
