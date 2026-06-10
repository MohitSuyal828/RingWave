const express = require("express");

const router = express.Router();

const { registerUser, loginUser, getProfile } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", verifyToken, getProfile);

module.exports = router;