// src/app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const userRoutes = require("./routes/userRoutes");
const saleRoutes = require("./routes/saleRoutes");
const profileRoutes = require("./routes/profileRoutes");
const customerRoutes = require("./routes/customerRoutes"); // Import product routes
const app = express();
const analyticsRoutes = require("./routes/analyticsRoutes");
const orderRoutes = require("./routes/orderRoutes"); // Import order routes
const wishlistRoutes = require("./routes/wishlistRoutes");

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://inventify-project.vercel.app"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", customerRoutes); // Mount product routes
app.use("/api/orders", orderRoutes); // Mount order routes
app.use("/api/wishlist", wishlistRoutes);

module.exports = app;
