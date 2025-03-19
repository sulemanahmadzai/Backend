// routes/wishlistRoutes.js
const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET /api/wishlist - Get current user's wishlist
router.get("/", authMiddleware, wishlistController.getWishlist);

// POST /api/wishlist - Add a product to the wishlist
router.post("/", authMiddleware, wishlistController.addToWishlist);

// DELETE /api/wishlist/:productId - Remove a product from the wishlist
router.delete(
  "/:productId",
  authMiddleware,
  wishlistController.removeFromWishlist
);

// DELETE /api/wishlist - (Optional) Clear the wishlist
router.delete("/", authMiddleware, wishlistController.clearWishlist);

module.exports = router;
