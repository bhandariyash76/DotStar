import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name can not be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description can not be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  compareAtPrice: {
    type: Number
  },
  currency: {
    type: String,
    default: 'INR'
  },
  images: [{
    src: String,
    alt: String,
    width: Number,
    height: Number
  }],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: false // Optional for now
  },
  categorySlug: String,
  categoryName: String,
  sizes: [String],
  colors: [{
    name: String,
    hex: String
  }],
  tags: [String],
  inStock: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewProduct: {
    type: Boolean,
    default: true
  },
  isNew: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

productSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (!this.categorySlug && this.categoryName) {
    this.categorySlug = this.categoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  next();
});

export default mongoose.model('Product', productSchema);
