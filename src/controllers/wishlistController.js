// controllers/wishlistController.js
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// Middleware to ensure req.user is set
const ensureAuthenticated = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  next();
};

// Get current user's wishlist
exports.getWishlist = [
  ensureAuthenticated,
  async (req, res) => {
    try {
      const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate(
        {
          path: "items",
          select: "name price images", // Ensure necessary fields are populated
        }
      );
      if (!wishlist) {
        return res.status(200).json({ items: [] });
      }
      res.status(200).json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching wishlist." });
    }
  },
];

// Add a product to the wishlist
exports.addToWishlist = [
  ensureAuthenticated,
  async (req, res) => {
    const { productId } = req.body;

    // Validate productId
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    try {
      // Check if the product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      // Find the user's wishlist or create one
      let wishlist = await Wishlist.findOne({ userId: req.user.id });
      if (!wishlist) {
        wishlist = new Wishlist({ userId: req.user.id, items: [productId] });
      } else {
        // Prevent duplicate entries
        if (wishlist.items.includes(productId)) {
          return res
            .status(400)
            .json({ message: "Product already in wishlist." });
        }
        wishlist.items.push(productId);
      }

      await wishlist.save();

      // Populate the updated wishlist
      wishlist = await Wishlist.findOne({ userId: req.user.id }).populate({
        path: "items",
        select: "name price images",
      });

      res.status(200).json(wishlist);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res
        .status(500)
        .json({ message: "Server error while adding to wishlist." });
    }
  },
];

// Remove a product from the wishlist
exports.removeFromWishlist = [
  ensureAuthenticated,
  async (req, res) => {
    const { productId } = req.params;

    try {
      const wishlist = await Wishlist.findOne({ userId: req.user.id });
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found." });
      }

      // Check if the product is in the wishlist
      if (!wishlist.items.includes(productId)) {
        return res.status(404).json({ message: "Product not in wishlist." });
      }

      // Remove the product
      wishlist.items = wishlist.items.filter(
        (item) => item.toString() !== productId
      );

      await wishlist.save();

      // Populate the updated wishlist
      const updatedWishlist = await Wishlist.findOne({
        userId: req.user.id,
      }).populate({
        path: "items",
        select: "name price images",
      });

      res.status(200).json(updatedWishlist);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res
        .status(500)
        .json({ message: "Server error while removing from wishlist." });
    }
  },
];

// Clear the wishlist (Optional)
exports.clearWishlist = [
  ensureAuthenticated,
  async (req, res) => {
    try {
      const wishlist = await Wishlist.findOne({ userId: req.user.id });
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found." });
      }

      wishlist.items = [];
      await wishlist.save();
      res.status(200).json({ message: "Wishlist cleared successfully." });
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      res
        .status(500)
        .json({ message: "Server error while clearing wishlist." });
    }
  },
];
