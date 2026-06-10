const { createCall, getAllCalls } = require("../models/callModel");

const logCall = async (req, res) => {
  try {
    const { caller_id, receiver_id, duration, status } = req.body;

    // Basic validation
    if (!caller_id || !receiver_id || !duration || !status) {
      return res.status(400).json({ message: "caller_id, receiver_id, duration, and status are required" });
    }

    const validStatuses = ["completed", "missed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const call = await createCall(caller_id, receiver_id, duration, status);

    res.status(201).json({
      message: "Call logged successfully",
      call,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to log call" });
  }
};

const getCallHistory = async (req, res) => {
  try {
    const calls = await getAllCalls();

    res.status(200).json({
      message: "Call history fetched successfully",
      count: calls.length,
      calls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch call history" });
  }
};

module.exports = {
  logCall,
  getCallHistory,
};