const Appointment = require('../models/appointment.js');
const mongoose = require('mongoose');
const { payByWaafiPay } = require('../paymentEvc.js');

// Create Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { userId, doctorId, appointmentTime, reason, phone, price } = req.body;
    console.log(req.body);

    const parsedDate = new Date(appointmentTime);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Invalid appointment time format." });
    }

    // Check for existing appointment
    const exists = await Appointment.findOne({
      doctorId,
      date: parsedDate
    });

    if (exists) {
      return res.status(409).json({ message: 'An appointment already exists for this doctor at this time.' });
    }

     const waafiResponse = await payByWaafiPay({
          phone: phone,
          amount: 0.01,
          merchantUid: process.env.merchantUid,
          apiUserId: process.env.apiUserId,
          apiKey: process.env.apiKey,
        });
       
        if (waafiResponse.status) {

    const newAppointment = new Appointment({
      userId,
      doctorId,
      date: parsedDate,
      reason,
      phone,
      appointmentprice: price,
      status: 'confirmed'
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
     } else {
          // Handling payment failure
          return res.status(400).send({
            status: "failed",
            message: `${waafiResponse.error}` ?? "Payment Failed Try Again",
          });
         
        }
  } catch (error) {
    console.error('Create Appointment Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'fullName email')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'fullName email')
      .populate('doctorId', 'name specialization');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointment' });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { date, reason, phone, appointmentprice, status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Check date conflict only if changing date
    if (date && new Date(date).toISOString() !== appointment.date.toISOString()) {
      const conflict = await Appointment.findOne({
        doctorId: appointment.doctorId,
        date: new Date(date),
        _id: { $ne: appointment._id }
      });

      if (conflict) {
        return res.status(409).json({ message: 'Another appointment exists for this doctor at that time.' });
      }

      appointment.date = date;
    }

    appointment.reason = reason || appointment.reason;
    appointment.phone = phone || appointment.phone;
    appointment.appointmentprice = appointmentprice || appointment.appointmentprice;
    appointment.status = status || appointment.status;

    await appointment.save();
    res.status(200).json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error during update' });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};


// Get appointments by User ID
exports.getAppointmentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await Appointment.find({ userId })
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by user:', error);
    res.status(500).json({ message: 'Failed to retrieve user appointments' });
  }
};


exports.getAppointmentReport = async (req, res) => {
  try {
    const { range } = req.params;
    let { start, end } = req.query;

    const now = new Date();
    let fromDate;
    let toDate = new Date();
    toDate.setHours(23, 59, 59, 999); // include entire current day

    switch (range) {
      case 'week':
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        fromDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        fromDate = new Date('2000-01-01');
        break;
      case 'custom':
        if (!start || !end) {
          return res.status(400).json({ error: 'Start and end dates required for custom range.' });
        }
        fromDate = new Date(start);
        toDate = new Date(end);
        toDate.setHours(23, 59, 59, 999);
        break;
      default:
        return res.status(400).json({ error: 'Invalid range type.' });
    }

    const appointments = await Appointment.find({
      createdAt: { $gte: fromDate, $lte: toDate } // ✅ filter by createdAt
    })
      .populate('userId', 'fullName email')
      .populate('doctorId', 'name specialization');

    const totalRevenue = appointments.reduce((acc, a) => acc + (parseFloat(a.appointmentprice) || 0), 0);

    res.json({
      count: appointments.length,
      totalRevenue,
      fromDate,
      toDate,
      appointments,
    });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


