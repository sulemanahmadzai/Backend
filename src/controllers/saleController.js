const Order = require("../models/Order");

exports.getRegionSales = async (req, res) => {
  try {
    const salesByRegion = await Order.aggregate([
      {
        $group: {
          _id: "$shippingAddress.country", // Group by country
          totalSales: { $sum: "$totalAmount" }, // Sum total sales
          orderCount: { $sum: 1 }, // Count the number of orders
        },
      },
      { $sort: { totalSales: -1 } }, // Optional: Sort by sales descending
    ]);

    res.status(200).json(salesByRegion);
  } catch (error) {
    console.error("Error fetching sales by region:", error);
    res.status(500).json({ error: "Error fetching sales by region" });
  }
};
