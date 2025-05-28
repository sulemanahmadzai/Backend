const bcrypt = require("bcrypt");
const User = require("../models/User"); // assuming your User model is in models/User
const generateToken = require("../utils/jwtUtils");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

// Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Registration Controller
exports.googleRegister = async (req, res) => {
  const { token } = req.body;

  console.log("Received token:", req.body.token);
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
  try {
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    // Check if the user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // If the user does not exist, create a new user
      user = new User({
        name,
        email,
        passwordHash: "", // No password for Google accounts
        createdAt: new Date(),
      });
      await user.save();
    }

    // Generate JWT Token
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Respond with user data and token
    res.status(200).json({
      msg: "Google registration successful",
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Google authentication failed", error: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub, email, name, picture } = ticket.getPayload();

    // Check if user exists in database
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new User({
        email,
        name,
        picture,
        googleId: sub,
        role: "customer",
        createdAt: new Date(),
        passwordHash: "", // No password for Google accounts
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send the token to the frontend
    res.status(200).json({
      token: jwtToken,
      message: "Google login successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during Google login:", error);
    res.status(500).json({
      message: "Google login failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Register Route
exports.register = async (req, res) => {
  const { name, email, passwordHash } = req.body;
  console.log(req.body);
  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    console.log(user);
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordHash, salt);

    // Create a new user
    user = new User({
      name,
      email,
      passwordHash: hashedPassword,
      role: "customer", // Changed from 'admin' to 'user' as default role
      createdAt: new Date(),
    });

    // Save the user in the database
    await user.save();

    // Create and sign the JWT token
    const token = generateToken(user._id);

    // Send response with token and user data
    res.status(201).json({
      msg: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Login Route
exports.login = async (req, res) => {
  const { email, passwordHash } = req.body;
  console.log(email, passwordHash);
  try {
    // Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "user not exists" });
    }
    console.log(user);
    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    console.log(isMatch);
    // Create and sign the JWT token
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true, // Ensures the cookie can't be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent over HTTPS in production
      sameSite: "Strict", // Prevents the cookie from being sent with cross-site requests (you can change to "Lax" if needed)
      maxAge: 3600000, // Sets the cookie's expiration time (1 hour in ms)
    });
    console.log(token);
    // Send response with token and user data
    res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Logout Route
exports.logout = async (req, res) => {
  // Clear the cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ msg: "Logged out successfully" });
};
