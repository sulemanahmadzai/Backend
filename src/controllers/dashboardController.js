const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

// Fetch Key Performance Indicators (KPIs)
exports.getKPIs = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalOrders = await Order.countDocuments();
    const totalCostOfGoodsSold = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] },
          },
        },
      },
    ]);
    const avgInventory = await Inventory.aggregate([
      { $group: { _id: null, avgQuantity: { $avg: "$quantity" } } },
    ]);

    const inventoryTurnover =
      totalCostOfGoodsSold[0]?.total && avgInventory[0]?.avgQuantity
        ? (totalCostOfGoodsSold[0].total / avgInventory[0].avgQuantity).toFixed(
            2
          )
        : 0;

    res.status(200).json({
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      inventoryTurnover,
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ message: "Error fetching KPIs" });
  }
};

// Fetch Chart Data

exports.getCharts = async (req, res) => {
  try {
    // 1. Sales Trends
    const salesTrends = await Order.aggregate([
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
    ]);

    // 2. Product Performance (Top-selling and slow-moving)
    const productPerformance = await Order.aggregate([
      // Step 1: Unwind the orderItems array to handle each item individually
      { $unwind: "$orderItems" },

      // Step 2: Group by productId to calculate total quantity sold for each product
      {
        $group: {
          _id: "$orderItems.productId", // Group by the productId in orderItems
          totalSold: { $sum: "$orderItems.quantity" }, // Sum up the quantities
        },
      },

      // Step 3: Lookup the corresponding product details from the Product collection
      {
        $lookup: {
          from: "products", // The collection name for products
          localField: "_id", // _id from the previous stage (productId)
          foreignField: "_id", // _id in the Product collection
          as: "productDetails", // Resulting array field with matched product details
        },
      },

      // Step 4: Unwind the productDetails array to make it a flat document
      { $unwind: "$productDetails" },

      // Step 5: Project the fields we need in the final result
      {
        $project: {
          name: "$productDetails.name", // Get product name from productDetails
          totalSold: 1, // Include totalSold from the grouping stage
        },
      },

      // Step 6: Sort by totalSold in descending order to get top-selling products
      { $sort: { totalSold: -1 } },
    ]);

    const topSelling = productPerformance.slice(0, 5); // Top 5 products
    const slowMoving = productPerformance.slice(-5); // Bottom 5 products

    // 3. Profit Margins
    const profitMargins = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$orderItems.price" },
          cost: { $sum: { $multiply: ["$orderItems.quantity", 10] } }, // Assume cost per unit is 10
        },
      },
      {
        $project: {
          profitMargin: {
            $multiply: [
              { $divide: [{ $subtract: ["$revenue", "$cost"] }, "$revenue"] },
              100,
            ],
          },
        },
      },
    ]);

    // Response
    res.status(200).json({
      salesTrends,
      topSelling,
      slowMoving,

      profitMargin: profitMargins[0]?.profitMargin || 0,
    });
  } catch (error) {
    console.error("Error fetching charts:", error);
    res.status(500).json({ message: "Error fetching charts" });
  }
};

// Fetch Recent Activity


exports.getTopProdcuts = async (req, res) => {
  const { period } = req.query; // 'daily', 'weekly', 'monthly'

  if (!["daily", "weekly", "monthly"].includes(period)) {
    return res
      .status(400)
      .json({ error: "Invalid period. Use daily, weekly, or monthly." });
  }

  try {
    // Define date range based on the period
    const now = new Date();
    let startDate;
    if (period === "daily") {
      // Start of today
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (period === "weekly") {
      // Start of the last 7 days
      startDate = new Date(now.setDate(now.getDate() - 6));
      startDate.setHours(0, 0, 0, 0); // Reset to midnight
    } else if (period === "monthly") {
      // Start of the current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Fetch and aggregate data
    const productPerformance = await Order.aggregate([
      // Filter orders created after startDate
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$orderItems" }, // Break orderItems into individual docs
      {
        $group: {
          _id: "$orderItems.productId",
          totalSold: { $sum: "$orderItems.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // Extract product details
      {
        $project: {
          productName: "$productDetails.name",
          totalSold: 1,
        },
      },
      { $sort: { totalSold: -1 } }, // Sort by most sold
      {
        $group: {
          _id: null,
          products: {
            $push: { productName: "$productName", totalSold: "$totalSold" },
          },
        },
      },
    ]);

    res.status(200).json({
      data: productPerformance.length > 0 ? productPerformance[0].products : [],
    });
  } catch (error) {
    console.error("Error fetching product performance:", error);
    res.status(500).json({
      message: "Server error while fetching product performance",
    });
  }
};

exports.getInventoryStatus = async (req, res) => {
  try {
    // Aggregate inventory data
    const inventoryStatus = await Inventory.aggregate([
      {
        $facet: {
          available: [
            { $match: { quantity: { $gt: 10 } } }, // Items with quantity > 10
            { $count: "count" },
          ],
          lowStock: [
            { $match: { quantity: { $gt: 0, $lte: 10 } } }, // Items with quantity between 1 and 10
            { $count: "count" },
          ],
          outOfStock: [
            { $match: { quantity: { $eq: 0 } } }, // Items with quantity = 0
            { $count: "count" },
          ],
        },
      },
    ]);

    // Format the response
    const response = {
      available: inventoryStatus[0]?.available[0]?.count || 0,
      lowStock: inventoryStatus[0]?.lowStock[0]?.count || 0,
      outOfStock: inventoryStatus[0]?.outOfStock[0]?.count || 0,
    };

    res.status(200).json({ data: response });
  } catch (error) {
    console.error("Error fetching inventory status:", error);
    res.status(500).json({ message: "Error fetching inventory status" });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    // Fetch recent orders (limit 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email"); // Populate user details

    // Fetch recent users (limit 5)
    const newUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    // Fetch low stock alerts (quantity <= threshold)
    const lowStockAlerts = await Inventory.find({
      $expr: { $lte: ["$quantity", "$threshold"] },
    })
      .populate("productId", "name")
      .limit(5);

    res.status(200).json({
      data: {
        recentOrders,
        newUsers,
        lowStockAlerts,
      },
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Error fetching recent activity" });
  }
};
