const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByUserId,
  getAppointmentReport,
} = require('../controllers/appointmentController');

// Routes
router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.get('/user/:userId', getAppointmentsByUserId);

router.get('/report/:range', getAppointmentReport);
module.exports = router;
