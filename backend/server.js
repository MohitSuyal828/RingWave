require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const pool = require("./src/config/db");
const logger = require("./src/config/logger");
const requestLogger = require("./src/middleware/requestLogger");
const { deprecationNotice } = require("./src/middleware/deprecationNotice");
const { createGracefulShutdown } = require("./src/utils/gracefulShutdown");
const authRoutes = require("./src/routes/authRoutes");
const callRoutes = require("./src/routes/callRoutes");
const detectionRoutes = require("./src/routes/detectionRoutes");
const { fail } = require("./src/utils/response");
const { errorHandler } = require("./src/middleware/errorHandler");

const app = express();

// ─── Request Logging — registered FIRST ─────────────────────────────────────
// Unchanged from item #12 — see prior project history for the full
// rationale on this placement (before helmet, before express.json(), before
// every route, so it observes every request including ones that never
// reach a route at all).
app.use(requestLogger);

app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
//
// `cors` was already a listed dependency but was never actually wired up —
// without this, every request from a browser-based frontend running on a
// different origin (e.g. the Vite dev server on localhost:5173) is blocked
// by the browser itself before it even reaches these routes, regardless of
// how correct the rest of the API is. FRONTEND_URL can be set in .env for a
// locked-down production origin; if unset, this falls back to reflecting
// the request's own origin (safe here since auth uses a Bearer token in
// the Authorization header, not cookies, so credentials: true is not
// required for this app to function).
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
  })
);

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "RingWave Backend Running ",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    req.log.error({ err: error }, "GET / failed — database query error");
    res.status(500).send("Database Connection Failed");
  }
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      db: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    req.log.error({ err: error }, "Health check failed — database unreachable");
    res.status(503).json({
      status: "error",
      db: "disconnected",
      uptime: process.uptime(),
    });
  }
});

// ─── API Versioning ───────────────────────────────────────────────────────────
//
// Roadmap item #14. Each router is mounted TWICE:
//
//   1. At the new, versioned path (/api/v1/...) — this is the current,
//      non-deprecated, recommended path going forward. No deprecation
//      middleware applied here.
//
//   2. At the original, unversioned path (/api/auth, /api/calls,
//      /api/detections) — kept fully functional for backward compatibility
//      with anything already coded against the old paths (existing
//      frontend code, existing Postman collections from earlier in this
//      project's history), but wrapped with deprecationNotice so every
//      response on these legacy paths carries Deprecation/Link headers
//      pointing at the v1 replacement.
//
// Mounting the SAME router object twice (rather than duplicating route
// definitions) means there is exactly one implementation of every endpoint
// — both paths share identical behavior, identical validation, identical
// everything, by construction. There is no way for the legacy and
// versioned paths to drift apart in behavior, because they are not two
// separate pieces of code at all.
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/calls", callRoutes);
app.use("/api/v1/detections", detectionRoutes);

app.use("/api/auth", deprecationNotice, authRoutes);
app.use("/api/calls", deprecationNotice, callRoutes);
app.use("/api/detections", deprecationNotice, detectionRoutes);

// ─── 404 Handler — unmatched routes ──────────────────────────────────────────
// Unchanged.
app.use((req, res) => {
  return fail(res, "Route not found", [], 404);
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// Unchanged — must remain the LAST app.use() call.
app.use(errorHandler);

// ─── Process-Level Safety Nets ───────────────────────────────────────────────
//
// Unchanged from item #12. Deliberately NOT routed through the graceful
// shutdown sequence below — per Node's own guidance, an uncaughtException
// means the process is in a genuinely unknown state, and attempting further
// async operations (closing the server, draining the pool) risks hanging or
// masking the real problem. A fast, simple exit here is the safer choice;
// graceful shutdown is reserved for the INTENTIONAL stop signals
// (SIGTERM/SIGINT) sent during a normal deploy or restart, where the
// process is healthy and just needs to wind down cleanly.
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught exception");
  process.exit(1);
});

// ─── Startup DB Check ─────────────────────────────────────────────────────────
//
// Changes from item #12's version: app.listen()'s return value is now
// captured into `server`, and createGracefulShutdown is wired up
// immediately after a successful start — passing it the live server
// instance, the shared pool, and the centralized logger. See
// src/utils/gracefulShutdown.js for the full shutdown sequence.
const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connection verified.");
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to the database on startup");
    process.exit(1);
  }

  const server = app.listen(process.env.PORT, () => {
    logger.info(`Server running on port ${process.env.PORT}`);
  });

  createGracefulShutdown({ server, pool, logger });
};

startServer();