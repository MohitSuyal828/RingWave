const express = require("express");

const router = express.Router();

const { logDetection, getDetectionHistory } = require("../controllers/detectionController");
const { verifyToken } = require("../middleware/authMiddleware");

// Protected routes — require a valid JWT
router.post("/", verifyToken, logDetection);
router.get("/history", verifyToken, getDetectionHistory);

module.exports = router;