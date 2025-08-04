const express = require('express');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController.js');

const multer = require('multer');
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post('/', upload.single('image'), createDoctor);
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id', upload.single('image'), updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;
