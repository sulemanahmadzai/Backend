// models/Wishlist.js
const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

// Create a unique index on userId
WishlistSchema.index({ userId: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

module.exports = Wishlist;
