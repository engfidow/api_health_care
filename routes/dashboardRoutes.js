const express = require('express');
const { getDashboard, getDoctorDashboard } = require('../controllers/dashboardController.js');

const router = express.Router();

// Single endpoint for all dashboard data
router.get('/', getDashboard);

router.get('/doctor', getDoctorDashboard); // GET /api/dashboard/doctor?userId=xxx


module.exports = router;
