import express from 'express';
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';

import multer from 'multer';
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

export default router;
