const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

// GET /api/analytics?timeRange=weekly&search=apple&sortField=stock&sortOrder=desc&category=Fruits&limit=5&skip=10
router.get("/", async (req, res) => {
  try {
    const { timeRange, search, sortField, sortOrder, category, limit, skip } =
      req.query;
    const dateRange = getDateRange(timeRange);

    const [sales, inventory, products, revenue] = await Promise.all([
      getSalesData(dateRange),
      getInventoryData({ search, sortField, sortOrder, category, limit, skip }),
      getTopProducts(dateRange),
      getRevenueData(dateRange),
    ]);

    res.json({
      sales,
      inventory,
      products,
      revenue,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to get date range
function getDateRange(timeRange) {
  const now = new Date();
  const start = new Date();

  switch (timeRange) {
    case "daily":
      start.setDate(now.getDate() - 7);
      break;
    case "weekly":
      start.setDate(now.getDate() - 30);
      break;
    case "monthly":
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }

  return { start, end: now };
}

// Get sales performance data
async function getSalesData(dateRange) {
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        value: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return salesData.map((item) => ({
    date: item._id,
    value: item.value,
  }));
}

// Updated getInventoryData with filters, sorting, pagination
async function getInventoryData({
  search = "",
  sortField = "name",
  sortOrder = "asc",
  category = "",
  limit,
  skip,
} = {}) {
  // Construct the pipeline
  const pipeline = [
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
  ];

  // If we need to filter by category, we must lookup categories
  // only if category is provided, otherwise we skip this step.
  let matchConditions = [];

  if (category && category.trim() !== "") {
    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "product.categories",
          foreignField: "_id",
          as: "cats",
        },
      },
      { $unwind: "$cats" }
    );

    // Match category by name
    matchConditions.push({ "cats.name": category });
  }

  // If searching by product name
  if (search && search.trim() !== "") {
    matchConditions.push({ "product.name": { $regex: search, $options: "i" } });
  }

  if (matchConditions.length > 0) {
    pipeline.push({ $match: { $and: matchConditions } });
  }

  // Group by product name to sum stock
  pipeline.push(
    {
      $group: {
        _id: {
          productId: "$product._id",
          productName: "$product.name",
          stock: "$quantity",
        },
        stock: { $sum: "$quantity" },
      },
    },
    {
      $project: {
        _id: 0,
        productId: "$_id.productId",
        name: "$_id.productName",
        stock: 1,
      },
    }
  );

  // Sort logic
  // Sort field can be "name" or "stock". Default: name
  const validFields = ["name", "stock"];
  if (!validFields.includes(sortField)) {
    sortField = "name";
  }

  const sortDir = sortOrder === "desc" ? -1 : 1;
  pipeline.push({ $sort: { [sortField]: sortDir } });

  // Pagination (skip & limit)
  if (skip && !isNaN(skip)) {
    pipeline.push({ $skip: parseInt(skip, 10) });
  }

  if (limit && !isNaN(limit)) {
    pipeline.push({ $limit: parseInt(limit, 10) });
  }

  // Execute pipeline
  const inventoryData = await Inventory.aggregate(pipeline);

  // Calculate totalStock and stockPercentage
  const totalStock = inventoryData.reduce((acc, curr) => acc + curr.stock, 0);
  const categories = inventoryData.map((item) => ({
    name: item.name,
    stock: item.stock,
    stockPercentage: totalStock > 0 ? (item.stock / totalStock) * 100 : 0,
  }));

  return { categories };
}

// Get top products
async function getTopProducts(dateRange) {
  // Define the previous period's date range
  const previousStart = new Date(dateRange.start);
  const previousEnd = new Date(dateRange.end);
  const duration = previousEnd - previousStart;

  previousStart.setTime(previousStart.getTime() - duration);
  previousEnd.setTime(previousEnd.getTime() - duration);

  // Fetch sales for the current period
  const currentSales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.productId",
        sales: { $sum: "$orderItems.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
  ]);

  // Fetch sales for the previous period
  const previousSales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: previousStart, $lte: previousEnd },
      },
    },
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.productId",
        sales: { $sum: "$orderItems.quantity" },
      },
    },
  ]);

  // Create a map for previous sales for easy lookup
  const previousSalesMap = previousSales.reduce((map, item) => {
    map[item._id] = item.sales;
    return map;
  }, {});

  // Calculate the percentage for each product
  return {
    products: currentSales.map((item) => {
      const previousSale = previousSalesMap[item._id] || 0; // Default to 0 if no sales in the previous period
      const percentage = previousSale
        ? ((item.sales - previousSale) / previousSale) * 100
        : 100; // If no previous sale, assume 100% growth
      return {
        id: item._id,
        name: item.product[0]?.name || "Unknown Product",
        sales: item.sales,
        trending: percentage > 0 ? "up" : "down",
        percentage: Math.round(percentage), // Round off for simplicity
      };
    }),
  };
}

// Get revenue insights
async function getRevenueData(dateRange) {
  const revenueResults = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $unwind: "$product.categories" },
    {
      $lookup: {
        from: "categories",
        localField: "product.categories",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category.name",
        value: {
          $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] },
        },
      },
    },
    {
      $group: {
        _id: null,
        categories: { $push: { name: "$_id", value: "$value" } },
        totalValue: { $sum: "$value" },
      },
    },
    { $unwind: "$categories" },
    {
      $addFields: {
        "categories.percentage": {
          $cond: {
            if: { $gt: ["$totalValue", 0] },
            then: {
              $multiply: [
                { $divide: ["$categories.value", "$totalValue"] },
                100,
              ],
            },
            else: 0,
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        categories: { $push: "$categories" },
      },
    },
    {
      $project: {
        _id: 0,
        categories: 1,
      },
    },
  ]);

  return revenueResults[0] || { categories: [] };
}

module.exports = router;
