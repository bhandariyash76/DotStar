import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    productSnapshot: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      price: { type: Number, required: true },
      categorySlug: String,
      image: {
        src: String,
        alt: String,
        width: Number,
        height: Number
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    selectedSize: {
      type: String,
      required: true
    },
    selectedColor: {
      name: { type: String, required: true },
      hex: { type: String, required: true }
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Cart', cartSchema);
