const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id };
    console.log("decoded", decoded);
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;
