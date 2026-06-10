const pool = require("../config/db");

const createCall = async (caller_id, receiver_id, duration, status) => {
  const query = `
    INSERT INTO call_history (caller_id, receiver_id, duration, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [caller_id, receiver_id, duration, status];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllCalls = async () => {
  const query = `
    SELECT
      ch.id,
      ch.caller_id,
      ch.receiver_id,
      ch.duration,
      ch.status,
      ch.created_at,
      caller.name  AS caller_name,
      caller.email AS caller_email,
      receiver.name  AS receiver_name,
      receiver.email AS receiver_email
    FROM call_history ch
    LEFT JOIN users caller  ON ch.caller_id   = caller.id
    LEFT JOIN users receiver ON ch.receiver_id = receiver.id
    ORDER BY ch.created_at DESC;
  `;

  const result = await pool.query(query);

  return result.rows;
};

module.exports = {
  createCall,
  getAllCalls,
};