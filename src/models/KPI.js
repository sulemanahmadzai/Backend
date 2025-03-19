// models/KPI.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const KPISchema = new Schema(
  {
    metric: { type: String, required: true }, // e.g., 'daily_sales'
    value: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KPI", KPISchema);
