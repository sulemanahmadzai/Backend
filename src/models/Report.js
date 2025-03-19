// models/Report.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    reportType: { type: String, required: true }, // e.g., 'sales', 'inventory'
    data: { type: Schema.Types.Mixed, required: true }, // The report content
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
