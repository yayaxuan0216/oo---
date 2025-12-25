const express = require('express');
const router = express.Router();
const chatController = require('../controllers/landlord/chatController');

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);

module.exports = router;