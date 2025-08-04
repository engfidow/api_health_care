const express = require('express');
const upload = require('../middlewares/upload.js');
const {
  registerUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser
} = require('../controllers/userController.js');

const router = express.Router();

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', upload.single('image'), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
