// models/Order.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: String, // Snapshot of product name at the time of order
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Snapshot of price at the time of order
});
const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [OrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: Schema.Types.Mixed }, // Details or reference
    shippingAddress: {
      type: Schema.Types.Mixed, // Copy of address at the time of order
      required: true,
      properties: {
        country: { type: String, required: true }, // Add country here
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
      },
    },
    trackingNumber: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
