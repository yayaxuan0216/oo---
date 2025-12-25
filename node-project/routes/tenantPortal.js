const express = require('express');
const router = express.Router();
const portalController = require('../controllers/tenant/portalController');


router.get('/info', portalController.getMyLivingInfo);

router.post('/note', portalController.updateTenantNote);

module.exports = router;