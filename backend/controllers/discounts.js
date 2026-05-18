import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Discount from '../models/Discount.js';
import { formatDiscount, isDiscountActive } from '../utils/discounts.js';

// @desc      Get active discounts
// @route     GET /api/v1/discounts
// @access    Public
export const getActiveDiscounts = asyncHandler(async (req, res) => {
  const discounts = await Discount.find({ isActive: true }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    discounts: discounts.filter((discount) => isDiscountActive(discount)).map(formatDiscount)
  });
});

// @desc      Get all discounts
// @route     GET /api/v1/discounts/admin
// @access    Private/Admin
export const getDiscounts = asyncHandler(async (req, res) => {
  const discounts = await Discount.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    discounts: discounts.map(formatDiscount)
  });
});

// @desc      Create discount
// @route     POST /api/v1/discounts
// @access    Private/Admin
export const createDiscount = asyncHandler(async (req, res) => {
  const discount = await Discount.create(req.body);

  res.status(201).json({
    success: true,
    discount: formatDiscount(discount)
  });
});

// @desc      Update discount
// @route     PUT /api/v1/discounts/:id
// @access    Private/Admin
export const updateDiscount = asyncHandler(async (req, res, next) => {
  const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!discount) {
    return next(new ErrorResponse('Discount not found', 404));
  }

  res.status(200).json({
    success: true,
    discount: formatDiscount(discount)
  });
});

// @desc      Delete discount
// @route     DELETE /api/v1/discounts/:id
// @access    Private/Admin
export const deleteDiscount = asyncHandler(async (req, res, next) => {
  const discount = await Discount.findByIdAndDelete(req.params.id);

  if (!discount) {
    return next(new ErrorResponse('Discount not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});
