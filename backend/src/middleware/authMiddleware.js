const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  // 1. Read the Authorization header.
  const authHeader = req.headers["authorization"];

  // 2. Expect format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  // 3. Verify the token against the secret.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    }
    return res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = { verifyToken };