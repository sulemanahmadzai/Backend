// controllers/orderController.js
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Place a new order
exports.placeOrder = async (req, res) => {
  const { shippingInfo, paymentMethod } = req.body;
  console.log(req.body);
  if (!shippingInfo || !paymentMethod) {
    return res
      .status(400)
      .json({ error: "Shipping info and payment method are required" });
  }

  try {
    // Fetch user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (total, item) => total + item.productId.price * item.quantity,
      0
    );
    const shippingCost = 5.0;
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + shippingCost + tax;

    // Create order items snapshot
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      productName: item.productId.name,
      quantity: item.quantity,
      price: item.productId.price,
    }));

    // Create new order
    const order = new Order({
      userId: req.user.id,
      orderItems,
      status: "pending",
      totalAmount,
      paymentMethod,
      shippingAddress: shippingInfo,
    });

    await order.save();

    // Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order placed successfully", order });
    console.log("Order placed successfully:", order);
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
};

// Get all orders for the logged-in user
// controllers/orderController.js

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("orderItems.productId") // Ensure product details are populated
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({
      _id: orderId,
      userId: req.user.id,
    }).populate("orderItems.productId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
