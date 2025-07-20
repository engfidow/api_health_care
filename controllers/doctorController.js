import Doctor from '../models/Doctor.js';
import fs from 'fs';
import path from 'path';

// Create
export const createDoctor = async (req, res) => {
  try {
    const { name, specialization, experience, phone, email, status } = req.body;
    const image = req.file?.filename || null;

    const doctor = new Doctor({
      name,
      specialization,
      experience,
      phone,
      email,
      image,
      status,
    });

    await doctor.save();
    res.status(201).json({ message: 'Doctor created successfully', doctor });
  } catch (error) {
    console.error('Create Doctor Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
};

// Get by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving doctor' });
  }
};

// Update
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const { name, specialization, experience, phone, email, status } = req.body;
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

    await doctor.save();
    res.status(200).json({ message: 'Doctor updated successfully', doctor });
  } catch (error) {
    console.error('Update Doctor Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete
export const deleteDoctor = async (req, res) => {
  try {
   
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    
    
   
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor' });
  }
};
