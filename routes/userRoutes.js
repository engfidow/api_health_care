import express from 'express';
import upload from '../middlewares/upload.js';
import {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser); // Add this line
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', upload.single('image'), updateUser);
router.delete('/:id', deleteUser);

export default router;
