const pool = require("../config/db");

// ─── Create Detection ────────────────────────────────────────────────────────
// Unchanged.
const createDetection = async (user_id, prediction, confidence_score) => {
  const query = `
    INSERT INTO detection_logs (user_id, prediction, confidence_score)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [user_id, prediction, confidence_score];

  const result = await pool.query(query, values);

  return result.rows[0];
};

// ─── Get Detections For One User (Paginated) ─────────────────────────────────
//
// Same pattern as callModel.js's getCallsByUser — see those comments for the
// full rationale on LIMIT/OFFSET placement and why ORDER BY is load-bearing
// for stable pagination.
const getDetectionsByUser = async (userId, limit, offset) => {
  const query = `
    SELECT
      dl.id,
      dl.user_id,
      dl.prediction,
      dl.confidence_score,
      dl.created_at,
      u.name  AS user_name,
      u.email AS user_email
    FROM detection_logs dl
    LEFT JOIN users u ON dl.user_id = u.id
    WHERE dl.user_id = $1
    ORDER BY dl.created_at DESC
    LIMIT $2
    OFFSET $3;
  `;

  const result = await pool.query(query, [userId, limit, offset]);

  return result.rows;
};

// ─── Count Detections For One User ───────────────────────────────────────────
//
// New. Same WHERE clause as getDetectionsByUser, kept side by side
// deliberately — see countCallsByUser in callModel.js for the full
// rationale on why these two queries' filters must never drift apart.
const countDetectionsByUser = async (userId) => {
  const query = `
    SELECT COUNT(*) AS total
    FROM detection_logs dl
    WHERE dl.user_id = $1;
  `;

  const result = await pool.query(query, [userId]);

  // See callModel.js's countCallsByUser for why parseInt is needed here —
  // COUNT(*) returns Postgres BIGINT, which node-postgres returns as a
  // string to avoid precision loss.
  return parseInt(result.rows[0].total, 10);
};

module.exports = {
  createDetection,
  getDetectionsByUser,
  countDetectionsByUser,
};