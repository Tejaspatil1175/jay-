const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyAccessToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   POST /api/chat
 * @desc    Send message to AI chatbot (supports optional authentication)
 * @access  Public/Private (optional auth)
 */
router.post('/', optionalAuth, chatController.chat);

/**
 * @route   POST /api/chat/new
 * @desc    Start new chat session
 * @access  Public
 */
router.post('/new', chatController.newChatSession);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history
 * @access  Public
 */
router.get('/history/:sessionId', chatController.getChatHistory);

/**
 * @route   DELETE /api/chat/history/:sessionId
 * @desc    Delete chat history
 * @access  Public
 */
router.delete('/history/:sessionId', chatController.deleteChatHistory);

module.exports = router;
