const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const User = require("../models/User");

const {
  getKPIs,
  getCharts,

  getTopProdcuts,
  getInventoryStatus,
  getRecentActivity,
} = require("../controllers/dashboardController");

// Route for KPIs
router.get("/kpis", getKPIs);

// Route for Charts
router.get("/charts", getCharts);

// Route for Recent Activity

router.get("/top-products", getTopProdcuts);

router.get("/inventory-status", getInventoryStatus);

router.get("/recent-activity", getRecentActivity);

module.exports = router;
