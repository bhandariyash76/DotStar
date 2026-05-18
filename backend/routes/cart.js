import express from 'express';
import { clearCart, getCart, replaceCart } from '../controllers/cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getCart)
  .put(protect, replaceCart)
  .delete(protect, clearCart);

export default router;
