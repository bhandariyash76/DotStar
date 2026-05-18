import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Product from '../models/Product.js';

const formatProduct = (product) => ({
  id: product._id,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  currency: product.currency || 'INR',
  images: product.images || [],
  category: product.categoryName || product.categorySlug || 'Uncategorized',
  categorySlug: product.categorySlug || 'uncategorized',
  sizes: product.sizes || [],
  colors: product.colors || [],
  tags: product.tags || [],
  inStock: (product.quantity !== undefined ? product.quantity > 0 : product.inStock) && product.inStock,
  isFeatured: product.isFeatured,
  isNew: product.isNew ?? product.isNewProduct,
  quantity: product.quantity ?? 10,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

// @desc      Get products
// @route     GET /api/v1/products
// @access    Public
export const getProducts = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.category) query.categorySlug = req.query.category;
  if (req.query.new === 'true') query.$or = [{ isNew: true }, { isNewProduct: true }];

  const products = await Product.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products: products.map(formatProduct)
  });
});

// @desc      Get product by slug
// @route     GET /api/v1/products/:slug
// @access    Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product: formatProduct(product)
  });
});

// @desc      Create product
// @route     POST /api/v1/products
// @access    Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product: formatProduct(product)
  });
});

// @desc      Update product
// @route     PUT /api/v1/products/:id
// @access    Private/Admin
export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product: formatProduct(product)
  });
});

// @desc      Delete product
// @route     DELETE /api/v1/products/:id
// @access    Private/Admin
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});
