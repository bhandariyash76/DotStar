import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: Object, required: true },
      price: { type: Number, required: true },
      size: { type: String, required: true },
      color: { type: Object, required: true },
      productId: {
        type: String,
        required: true
      }
    }
  ],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  discount: {
    id: String,
    name: String,
    code: String,
    scope: String,
    type: String,
    value: Number,
    amount: Number
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'return_requested', 'return_approved', 'return_rejected', 'exchange_requested', 'exchange_approved'],
    default: 'pending'
  },
  returnAction: {
    type: String,
    enum: ['Refund', 'Return', 'Exchange', 'None'],
    default: 'None'
  },
  returnStatus: {
    type: String,
    enum: ['none', 'on_hold', 'approved', 'rejected'],
    default: 'none'
  },
  returnReason: {
    type: String
  },
  returnComments: {
    type: String
  },
  returnedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);
