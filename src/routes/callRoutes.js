const express = require("express");

const router = express.Router();

const { logCall, getCallHistory } = require("../controllers/callController");
const { verifyToken } = require("../middleware/authMiddleware");

// Protected routes — require a valid JWT
router.post("/", verifyToken, logCall);
router.get("/history", verifyToken, getCallHistory);

module.exports = router;