const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Route imports (converted to CommonJS)
const userRoutes = require('./routes/userRoutes.js');
const doctorRoutes = require('./routes/doctorRoutes.js');
const appointmentRoutes = require('./routes/appointmentRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

app.use('/api/doctors', doctorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch((err) => console.log('Mongo error:', err.message));
