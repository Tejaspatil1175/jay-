const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyAccessToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyAccessToken);

/**
 * @route   POST /api/documents/upload
 * @desc    Upload and process document
 * @access  Private
 */
router.post('/upload', documentController.uploadDocument);

/**
 * @route   GET /api/documents
 * @desc    Get all user documents
 * @access  Private
 */
router.get('/', documentController.getDocuments);

/**
 * @route   GET /api/documents/:documentId
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:documentId', documentController.getDocumentById);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete document
 * @access  Private
 */
router.delete('/:documentId', documentController.deleteDocument);

module.exports = router;
