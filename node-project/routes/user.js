const express = require('express');
const router = express.Router();
const updateProfile = require('../controllers/user/updateProfile');
const getUserById = require('../controllers/user/getUserById');
router.post('/update', updateProfile); // 更新資料
router.get('/:id', getUserById);

module.exports = router;