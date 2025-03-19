const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const profileController = require("../controllers/profileController");

// GET profile
router.get("/", authMiddleware, profileController.getProfile);

// UPDATE profile (basic info)
router.put("/", authMiddleware, profileController.updateProfile);

// CHANGE password
router.put(
  "/change-password",
  authMiddleware,
  profileController.changePassword
);

module.exports = router;
