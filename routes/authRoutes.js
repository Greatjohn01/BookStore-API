import express from 'express';
import {
  register,
  verifyEmail,
  login,
  logout,
} from '../controllers/authController.js';


const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);

export default router;