import express from 'express';
import {
  createDiscount,
  deleteDiscount,
  getActiveDiscounts,
  getDiscounts,
  updateDiscount
} from '../controllers/discounts.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getActiveDiscounts).post(protect, authorize('admin'), createDiscount);
router.route('/admin').get(protect, authorize('admin'), getDiscounts);
router
  .route('/:id')
  .put(protect, authorize('admin'), updateDiscount)
  .delete(protect, authorize('admin'), deleteDiscount);

export default router;
