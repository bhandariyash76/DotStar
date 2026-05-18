import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Cart from '../models/Cart.js';
import Discount from '../models/Discount.js';
import Order from '../models/Order.js';
import { formatDiscount, getBestDiscount } from '../utils/discounts.js';

const formatOrder = (order) => ({
  id: order._id,
  userId: order.user,
  items: order.orderItems.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: item.price,
    quantity: item.qty,
    size: item.size,
    color: item.color,
    image: item.image
  })),
  status: order.status,
  subtotal: order.orderItems.reduce((sum, item) => sum + item.price * item.qty, 0),
  discount: order.discount,
  shippingCost: order.shippingPrice,
  tax: order.taxPrice,
  total: order.totalPrice,
  shippingAddress: order.shippingAddress,
  isPaid: order.isPaid,
  isDelivered: order.isDelivered,
  returnAction: order.returnAction,
  returnStatus: order.returnStatus,
  returnReason: order.returnReason,
  returnComments: order.returnComments,
  returnedAt: order.returnedAt,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

// @desc      Get order history for current user
// @route     GET /api/v1/orders/myorders
// @access    Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders: orders.map(formatOrder)
  });
});

// @desc      Get all orders
// @route     GET /api/v1/orders
// @access    Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'firstName lastName email');

  res.status(200).json({
    success: true,
    orders: orders.map((order) => ({
      ...formatOrder(order),
      customer: order.user
    }))
  });
});

// @desc      Update order status
// @route     PUT /api/v1/orders/:id/status
// @access    Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, isPaid, isDelivered, returnStatus } = req.body;
  const update = {};

  if (status) update.status = status;
  if (returnStatus) update.returnStatus = returnStatus;
  if (typeof isPaid === 'boolean') {
    update.isPaid = isPaid;
    update.paidAt = isPaid ? new Date() : undefined;
  }
  if (typeof isDelivered === 'boolean') {
    update.isDelivered = isDelivered;
    update.deliveredAt = isDelivered ? new Date() : undefined;
  }

  const order = await Order.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    order: formatOrder(order)
  });
});

// @desc      Create an order from request items
// @route     POST /api/v1/orders
// @access    Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new ErrorResponse('Order requires at least one item', 400));
  }

  if (!shippingAddress) {
    return next(new ErrorResponse('Shipping address is required', 400));
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.productSnapshot.price * item.quantity,
    0
  );
  const discounts = await Discount.find({ isActive: true });
  const bestDiscount = getBestDiscount(discounts, items, subtotal);
  const discountAmount = bestDiscount?.amount || 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingPrice = discountedSubtotal >= 2999 ? 0 : 199;
  const taxPrice = Math.round(discountedSubtotal * 0.05);
  const totalPrice = discountedSubtotal + shippingPrice + taxPrice;

  const order = await Order.create({
    user: req.user.id,
    orderItems: items.map((item) => ({
      name: item.productSnapshot.name,
      qty: item.quantity,
      image: item.productSnapshot.image,
      price: item.productSnapshot.price,
      size: item.selectedSize,
      color: item.selectedColor,
      productId: item.productId
    })),
    shippingAddress,
    taxPrice,
    shippingPrice,
    totalPrice,
    discount: bestDiscount?.amount
      ? {
          ...formatDiscount(bestDiscount.discount),
          amount: bestDiscount.amount
        }
      : undefined,
    isPaid: paymentMethod === 'cod' ? false : false,
    status: 'confirmed'
  });

  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { user: req.user.id, items: [] },
    { upsert: true }
  );

  res.status(201).json({
    success: true,
    order: formatOrder(order)
  });
});

// @desc      Request order return/refund/exchange
// @route     PUT /api/v1/orders/:id/return
// @access    Private
export const requestOrderReturn = asyncHandler(async (req, res, next) => {
  const { returnAction, returnReason, returnComments } = req.body;

  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  if (order.status === 'cancelled' || order.status === 'returned' || order.status === 'return_approved' || order.status === 'exchange_approved') {
    return next(new ErrorResponse('Order cannot be modified', 400));
  }

  order.status = returnAction === 'Exchange' ? 'exchange_requested' : 'return_requested';
  order.returnAction = returnAction || 'Return';
  order.returnStatus = 'on_hold';
  order.returnReason = returnReason || 'Fit Issue';
  order.returnComments = returnComments || '';
  order.returnedAt = new Date();

  await order.save();

  res.status(200).json({
    success: true,
    order: formatOrder(order)
  });
});
