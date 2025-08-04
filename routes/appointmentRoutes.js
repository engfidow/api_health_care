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
  getAppointmentsByDoctorUserId,
} = require('../controllers/appointmentController');

// Routes
router.get('/doctor/user/:userId', getAppointmentsByDoctorUserId);
router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);
router.get('/user/:userId', getAppointmentsByUserId);

router.get('/report/:range', getAppointmentReport);
module.exports = router;

