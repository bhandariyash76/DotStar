import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateMe
} from '../controllers/auth.js';

const router = express.Router();

import { protect } from '../middleware/auth.js';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

export default router;
