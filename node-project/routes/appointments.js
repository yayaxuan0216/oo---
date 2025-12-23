const express = require('express');
const router = express.Router();

const createAppointment = require('../controllers/appointments/createAppointment');
const getLandlordAppointments = require('../controllers/appointments/getLandlordAppointments');
const updateAppointmentStatus = require('../controllers/appointments/updateAppointmentStatus');
const negotiateAppointment = require('../controllers/appointments/negotiateAppointment');
const getTenantAppointments = require('../controllers/appointments/getTenantAppointments');
const addMessage = require('../controllers/appointments/addMessage');

// 設定路由：POST /api/appointments/create
router.post('/create', createAppointment);

router.get('/landlord/:id', getLandlordAppointments);
router.post('/:id/status', updateAppointmentStatus);
router.post('/:id/negotiate', negotiateAppointment);
router.get('/tenant/:id', getTenantAppointments);
// 通用的留言路由
router.post('/:id/message', require('../controllers/appointments/addMessage'));
module.exports = router;