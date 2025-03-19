const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Product = require("./models/Product");
const Category = require("./models/Category");
const Order = require("./models/Order");
const Inventory = require("./models/Inventory");
const KPI = require("./models/KPI");

const getKPIs = async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.countDocuments();

    // Total Revenue
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalRevenueAmount = totalRevenue.length ? totalRevenue[0].total : 0;

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Inventory Turnover
    const totalCOGS = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalCOGS: {
            $sum: { $multiply: ["$items.quantity", "$items.costPrice"] },
          },
        },
      },
    ]);
    const totalCostOfGoodsSold = totalCOGS.length ? totalCOGS[0].totalCOGS : 0;

    const inventoryData = await Product.aggregate([
      {
        $group: {
          _id: null,
          averageInventory: { $avg: "$quantity" },
        },
      },
    ]);
    const avgInventory = inventoryData.length
      ? inventoryData[0].averageInventory
      : 0;

    const inventoryTurnover = avgInventory
      ? totalCostOfGoodsSold / avgInventory
      : 0;

    // Send response
    res.status(200).json({
      totalUsers,
      totalRevenue: totalRevenueAmount,
      totalOrders,
      inventoryTurnover,
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ message: "Error fetching KPIs" });
  }
};
