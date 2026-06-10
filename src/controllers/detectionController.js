const { createDetection, getAllDetections } = require("../models/detectionModel");

const logDetection = async (req, res) => {
  try {
    const { user_id, prediction, confidence_score } = req.body;

    // Basic validation — all fields required
    if (!user_id || !prediction || confidence_score === undefined) {
      return res.status(400).json({
        message: "user_id, prediction, and confidence_score are required",
      });
    }

    // confidence_score must be a number between 0 and 100
    const score = parseFloat(confidence_score);
    if (isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({
        message: "confidence_score must be a number between 0 and 100",
      });
    }

    const validPredictions = ["likely_synthetic", "likely_real", "uncertain"];
    if (!validPredictions.includes(prediction)) {
      return res.status(400).json({
        message: `prediction must be one of: ${validPredictions.join(", ")}`,
      });
    }

    const detection = await createDetection(user_id, prediction, score);

    res.status(201).json({
      message: "Detection logged successfully",
      detection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to log detection" });
  }
};

const getDetectionHistory = async (req, res) => {
  try {
    const detections = await getAllDetections();

    res.status(200).json({
      message: "Detection history fetched successfully",
      count: detections.length,
      detections,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch detection history" });
  }
};

module.exports = {
  logDetection,
  getDetectionHistory,
};