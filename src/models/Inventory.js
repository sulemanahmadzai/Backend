// models/Inventory.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const InventorySchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      unique: true,
      required: true,
    },
    quantity: { type: Number, required: true },
    threshold: { type: Number, default: 0 }, // For low-stock alerts
    location: String, // Warehouse or store location
    expirationDate: Date, // If applicable
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);
