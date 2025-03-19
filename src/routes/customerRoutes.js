const express = require("express");
const router = express.Router();
const customerController = require("../controllers/CustomerController");
const authMiddleware = require("../middlewares/authMiddleware");
// GET all products
router.get("/products", customerController.getAllProducts);

router.get("/cart", authMiddleware, customerController.getCart);

// Add to cart
router.post("/cart", authMiddleware, customerController.addToCart);

// Update cart item quantity
router.put(
  "/cart/:productId",
  authMiddleware,
  customerController.updateCartItem
);

// Remove item from cart
router.delete(
  "/cart/:productId",
  authMiddleware,
  customerController.removeFromCart
);

// Clear cart
router.delete("/cart", authMiddleware, customerController.clearCart);

router.get("/products/p", customerController.fetchProducts);

router.get("/products/categories", customerController.fetchCategories);

module.exports = router;
