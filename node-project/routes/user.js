const express = require('express');
const router = express.Router();
const updateProfile = require('../controllers/user/updateProfile');
const getUserById = require('../controllers/user/getUserById');
const controller = require('../controllers/contracts/tenantsController');
router.post('/update', updateProfile); // 更新資料
router.get('/:id', getUserById);
router.get('/', controller.getRoomTenants);

module.exports = router;