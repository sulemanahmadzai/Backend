const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/google-register", authController.googleRegister);
router.post("/google-login", authController.googleLogin);

router.post("/login", authController.login);

router.post("/logout", authController.logout);

module.exports = router;

// Routes
