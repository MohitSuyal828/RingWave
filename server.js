require("dotenv").config();

const express = require("express");
const pool = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const callRoutes = require("./src/routes/callRoutes");
const detectionRoutes = require("./src/routes/detectionRoutes");

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "RingWave Backend Running ",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Database Connection Failed");
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/detections", detectionRoutes);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});