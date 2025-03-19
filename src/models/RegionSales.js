const mongoose = require("mongoose");

const RegionSalesSchema = new mongoose.Schema({
  region: { type: String, required: true },
  totalSales: { type: Number, required: true },
});

module.exports = mongoose.model("RegionSales", RegionSalesSchema);

