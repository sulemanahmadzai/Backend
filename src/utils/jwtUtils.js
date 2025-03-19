// utils/jwtUtils.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = generateToken;
