const express = require('express');
const router = express.Router();
const updateProfile = require('../controllers/user/updateProfile');
const getUserById = require('../controllers/user/getUserById');
const tenantsController = require('../controllers/contracts/tenantsController');
const userController = require('../controllers/user/userController');
router.post('/update', updateProfile); // 更新資料
router.get('/search', userController.searchUserByPhone);
router.get('/:id', getUserById);
router.get('/', tenantsController.getRoomTenants);
router.get('/search', userController.searchUserByPhone);
module.exports = router;