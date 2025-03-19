const Product = require("../models/Product");

const Category = require("../models/Category"); // Import the Category model
const Cart = require("../models/Cart");
// Fetch all products
exports.getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      availability,
      page = 1,
      limit = 12,
    } = req.query;
    console.log(req.query);
    // Build query object based on provided filters
    let query = {};

    // Search by product name (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      // Find the category document by name
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.categories = categoryDoc._id;
      } else {
        // If category not found, return empty result
        return res.status(200).json({
          products: [],
          total: 0,
          page: Number(page),
          pages: 0,
        });
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by availability/status
    if (availability) {
      query.status = availability === "true" ? "available" : "out_of_stock";
    }

    // Pagination setup
    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 12;
    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / perPage);

    // Fetch products based on query with pagination
    const products = await Product.find(query)
      .populate("categories", "name") // Populate category names
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .exec();

    res.status(200).json({
      products,
      total,
      page: currentPage,
      pages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products." });
  }
};

// Get Cart for the Logged-In User
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
      "name price images"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// Add Item to Cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ error: "Product ID and quantity are required" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already exists in the cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    // Populate the cart before sending response
    cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
      "name price images"
    );
    res.json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

// Update Quantity of an Item in the Cart
exports.updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate the cart before sending response
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
      "name price images"
    );
    res.json(updatedCart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update cart item" });
  }
};

// Remove Item from Cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();

    // Populate the cart before sending response
    const updatedCart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
      "name price images"
    );
    res.json(updatedCart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};

// Clear Entire Cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};

// controllers/productController.js

// controllers/productController.js
// controllers/productController.js

exports.fetchProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      availability,
      page = 1,
      limit = 12,
    } = req.query;

    // Build query object based on provided filters
    let query = {};

    // Search by product name (case-insensitive)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      // Find the category document by name
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.categories = categoryDoc._id;
      } else {
        // If category not found, return empty result
        return res.status(200).json({
          products: [],
          total: 0,
          page: Number(page),
          pages: 0,
        });
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by availability/status
    if (availability) {
      query.status = availability === "true" ? "available" : "out_of_stock";
    }

    // Pagination setup
    const currentPage = Number(page) || 1;
    const perPage = Number(limit) || 12;
    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / perPage);

    // Fetch products based on query with pagination
    const products = await Product.find(query)
      .populate("categories", "name") // Populate category names
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .exec();

    res.status(200).json({
      products,
      total,
      page: currentPage,
      pages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products." });
  }
};

exports.fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).exec();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching categories." });
  }
};
