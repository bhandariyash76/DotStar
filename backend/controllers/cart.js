import asyncHandler from '../middleware/async.js';
import Cart from '../models/Cart.js';

const calculateCart = (cart) => {
  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.productSnapshot.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal,
    itemCount
  };
};

// @desc      Get current user cart
// @route     GET /api/v1/cart
// @access    Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  res.status(200).json({
    success: true,
    cart: calculateCart(cart)
  });
});

// @desc      Replace current user cart
// @route     PUT /api/v1/cart
// @access    Private
export const replaceCart = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { user: req.user.id, items },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    cart: calculateCart(cart)
  });
});

// @desc      Clear current user cart
// @route     DELETE /api/v1/cart
// @access    Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { user: req.user.id, items: [] },
    { new: true, upsert: true }
  );

  res.status(200).json({
    success: true,
    cart: calculateCart(cart)
  });
});
