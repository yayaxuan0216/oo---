const express = require('express');
const router = express.Router();

// 引入 Controller (確保路徑對應到您剛剛建立的檔案)
const registerController = require('../controllers/auth/register');
const loginController = require('../controllers/auth/login');
const updateProfileController = require('../controllers/auth/updateProfile');
const changePasswordController = require('../controllers/auth/changePassword');

// ==============================
//  定義路由 (Routes)
// ==============================

// 1. 註冊
router.post('/register', registerController);

// 2. 登入
router.post('/login', loginController);

// 3. 更新基本資料
router.post('/update-profile', updateProfileController);

// 4. 修改密碼
router.post('/change-password', changePasswordController);

module.exports = router;