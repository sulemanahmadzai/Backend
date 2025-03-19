// models/Supplier.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
    },
    productsSupplied: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    // Supply orders could be a separate collection or embedded here
    // supplyOrders: [SupplyOrderSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", SupplierSchema);
