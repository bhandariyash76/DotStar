import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true
    },
    scope: {
      type: String,
      enum: ['cart', 'product', 'collection'],
      required: true,
      default: 'cart'
    },
    productId: {
      type: String
    },
    collectionSlug: {
      type: String
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage'
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    minCartValue: {
      type: Number,
      default: 0,
      min: 0
    },
    maxCartValue: {
      type: Number,
      min: 0
    },
    startsAt: {
      type: Date
    },
    endsAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

discountSchema.index({ code: 1 }, { unique: true, sparse: true });

export default mongoose.model('Discount', discountSchema);
