// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware"); // Ensure user is authenticated

// Place a new order
router.post("/", authMiddleware, orderController.placeOrder);

// Get all orders for the user
router.get("/", authMiddleware, orderController.getUserOrders);

// Get a specific order by ID
router.get("/:orderId", authMiddleware, orderController.getOrderById);

module.exports = router;
