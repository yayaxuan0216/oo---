// routes/contracts.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/contracts/contractsController');

// 對應 GET /api/contracts
router.get('/', controller.getContracts);

// 對應 POST /api/contracts
router.post('/', controller.createContract);

// 對應 PUT /api/contracts/:id/update-pdf
router.put('/:id/update-pdf', controller.updateContractPdf);

// 對應 PUT /api/contracts/:id/landlord-sign
router.put('/:id/landlord-sign', controller.landlordSign);

// 對應 PUT /api/contracts/:id/tenant-sign
router.put('/:id/tenant-sign', controller.tenantSign);

module.exports = router;