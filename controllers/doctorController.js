const fs = require('fs');
const path = require('path');
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor.js');

// CREATE
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      specialization,
      experience,
      phone,
      email,
      password,
      status,
      appointmentprice,
      language,
    } = req.body;

    const image = req.file?.filename || null;

    // Check if email already exists in user model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password from request body
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      fullName: name,
      email,
      password: hashedPassword,
      role: 'doctor',
      image,
    });
    await user.save();

    // Create doctor linked to the user
    const doctor = new Doctor({
      userId: user._id,
      name,
      specialization,
      experience,
      phone,
      email,
      appointmentprice,
      language,
      image,
      status,
    });

    await doctor.save();

    res.status(201).json({ message: 'Doctor and user created successfully', doctor });
  } catch (error) {
    console.error('Create Doctor Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const {
      name,
      specialization,
      experience,
      phone,
      email,
      status,
      appointmentprice,
      language,
    } = req.body;
    const newImage = req.file?.filename;

    if (newImage && doctor.image) {
      fs.unlinkSync(path.join('uploads', doctor.image)); // delete old image
    }

    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.experience = experience || doctor.experience;
    doctor.phone = phone || doctor.phone;
    doctor.email = email || doctor.email;
    doctor.status = status || doctor.status;
    doctor.image = newImage || doctor.image;
    doctor.appointmentprice = appointmentprice || doctor.appointmentprice;
    doctor.language = language || doctor.language;

    await doctor.save();
    res.status(200).json({ message: 'Doctor updated successfully', doctor });
  } catch (error) {
    console.error('Update Doctor Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET ALL
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
};

// GET BY ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving doctor' });
  }
};

// DELETE
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor' });
  }
};

// Export all functions
module.exports = {
  createDoctor,
  updateDoctor,
  getDoctors,
  getDoctorById,
  deleteDoctor,
};
