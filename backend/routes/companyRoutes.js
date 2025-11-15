const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

/**
 * @route   GET /api/company/:symbol
 * @desc    Get company financial data
 * @access  Public
 */
router.get('/:symbol', companyController.getCompanyData);

/**
 * @route   GET /api/company/:symbol/refresh
 * @desc    Force refresh company data
 * @access  Public
 */
router.get('/:symbol/refresh', companyController.refreshCompanyData);

/**
 * @route   GET /api/companies
 * @desc    Get all stored companies
 * @access  Public
 */
router.get('/', companyController.getAllCompanies);

module.exports = router;
