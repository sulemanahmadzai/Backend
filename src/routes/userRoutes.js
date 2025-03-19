const express = require("express");
const router = express.Router();
const {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getUserById,
  updateUserRoleAndStatus,
} = require("../controllers/userController");

// Get all users
router.get("/", getUsers);

// Add a new user
router.post("/", addUser);

// Update an existing user
router.put("/:id", updateUser);

// Delete a user
router.delete("/:id", deleteUser);

// router.get("/:id", getUserById);
// routes/userRoutes.js
router.get("/:id", getUserById);

router.put("/:id/role-status", updateUserRoleAndStatus);

module.exports = router;
