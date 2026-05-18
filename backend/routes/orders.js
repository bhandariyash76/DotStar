import express from 'express';
import { createOrder, getMyOrders, getOrders, updateOrderStatus } from '../controllers/orders.js';
import { authorize, protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, authorize('admin'), getOrders).post(protect, createOrder);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/status').put(protect, authorize('admin'), updateOrderStatus);

export default router;
