const express = require('express');
const router = express.Router();
// 引用剛剛寫好的 controller
const tenantsController = require('../controllers/landlord/tenantsController');


// GET /api/landlord/tenants?landlordId=...
router.get('/tenants', tenantsController.getTenants);

// POST /api/landlord/tenants
router.post('/tenants', tenantsController.addTenant);

// PUT /api/landlord/tenants/:id
router.put('/tenants/:id', tenantsController.updateTenant);
module.exports = router;