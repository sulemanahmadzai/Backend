// models/StockAlert.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const StockAlertSchema = new Schema(
  {
    inventoryItemId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    type: {
      type: String,
      enum: ["low_stock", "out_of_stock", "expiring_soon"],
      required: true,
    },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockAlert", StockAlertSchema);
