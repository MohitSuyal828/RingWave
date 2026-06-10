const pool = require("../config/db");

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

const getAllDetections = async () => {
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
    ORDER BY dl.created_at DESC;
  `;

  const result = await pool.query(query);

  return result.rows;
};

module.exports = {
  createDetection,
  getAllDetections,
};