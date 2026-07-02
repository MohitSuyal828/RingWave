const bcrypt = require("bcrypt");
const { createUser, findUserByEmail, findUserById, updateUser } = require("../models/userModel");
const {
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} = require("../models/refreshTokenModel");
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token");
const { success, fail } = require("../utils/response");

const REFRESH_TOKEN_EXPIRES_IN_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "7",
  10
);

const parseExpiresInToSeconds = (duration) => {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());

  if (!match) {
    return 15 * 60;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const secondsPerUnit = { s: 1, m: 60, h: 3600, d: 86400 };

  return value * secondsPerUnit[unit];
};

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = parseExpiresInToSeconds(
  process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
);

// ─── Register User ────────────────────────────────────────────────────────────
//
// Changes from the previous batch:
//   BEFORE  bcrypt.hash(password, 10)
//   AFTER   bcrypt.hash(password, 12)
//
//   Cost factor 10 was the bare bcrypt default. 12 is the more commonly
//   recommended baseline for production systems as of 2026 hardware —
//   each +1 to the cost factor doubles the work required per hash attempt,
//   so going from 10 to 12 makes brute-forcing a single password roughly
//   4x slower, at the cost of a small, one-time increase in hashing time
//   during registration and login (bcrypt.compare also re-runs the same
//   cost factor embedded in the stored hash, so this only affects NEWLY
//   hashed passwords — existing hashes already in the database keep
//   working exactly as before, since bcrypt encodes its own cost factor
//   inside each hash string).
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await createUser(name, email, hashedPassword);

    // createUser's RETURNING * includes the password hash — never send that
    // back to the client. Strip it before building the response.
    const { password: _password, ...safeUser } = user;

    return success(res, { user: safeUser }, "User registered successfully", 201);
  } catch (error) {
    if (error.code === "23505") {
      return fail(res, "An account with this email already exists", [], 409);
    }
    return next(error);
  }
};

// ─── Login User ───────────────────────────────────────────────────────────────
//
// "Invalid email or password" for both the not-found and wrong-password
// cases is an EXPECTED failure (a real, anticipated outcome of this
// endpoint, not a bug) — it stays as a direct fail() call with 401, not
// next(error). Only genuinely unexpected failures (e.g. the DB connection
// itself drops mid-query) go to the catch block's next(error).
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return fail(res, "Invalid email or password", [], 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return fail(res, "Invalid email or password", [], 401);
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

    await createRefreshToken(user.id, tokenHash, expiresAt);

    return success(
      res,
      {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      "Login successful",
      200
    );
  } catch (error) {
    return next(error);
  }
};

// ─── Refresh Access Token ────────────────────────────────────────────────────
//
// "Invalid or expired refresh token" is the expected failure path for this
// endpoint (the entire reason it exists is to be called with tokens that
// may have expired) — stays a direct fail() call, not next(error).
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const tokenHash = hashToken(refreshToken);

    const tokenRow = await findValidRefreshToken(tokenHash);

    if (!tokenRow) {
      return fail(
        res,
        "Invalid or expired refresh token. Please log in again.",
        [],
        401
      );
    }

    const user = await findUserById(tokenRow.user_id);

    if (!user) {
      return fail(
        res,
        "Invalid or expired refresh token. Please log in again.",
        [],
        401
      );
    }

    const accessToken = generateAccessToken(user);

    return success(
      res,
      {
        accessToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      },
      "Token refreshed successfully",
      200
    );
  } catch (error) {
    return next(error);
  }
};

// ─── Logout User ──────────────────────────────────────────────────────────────
// Idempotent by design — always succeeds. No expected-failure branch needed.
const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const tokenHash = hashToken(refreshToken);

    await revokeRefreshToken(tokenHash);

    return success(res, {}, "Logged out successfully", 200);
  } catch (error) {
    return next(error);
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
//
// "User not found" is reachable in an edge case (token valid, but the user
// row was deleted after the token was issued) — an expected, identifiable
// failure, so it stays a direct fail() call with 404.
const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return fail(res, "User not found", [], 404);
    }

    return success(res, { user }, "Profile fetched successfully", 200);
  } catch (error) {
    return next(error);
  }
};

// ─── Update Profile (Partial) ────────────────────────────────────────────────
//
// New endpoint, backing PATCH /api/auth/profile. req.body is already
// validated and shaped by validate(updateProfileSchema) before this runs —
// guaranteed to contain at least one of {name, password}, and if password
// is present, current_password is guaranteed present too. No further
// "is this empty" checks are needed here; Zod already enforced that.
//
// Two independent concerns, handled in sequence:
//
//   1. If password is being changed: re-fetch the FULL user row (including
//      the password hash — findUserById deliberately excludes it, so
//      findUserByEmail is used here instead, since it SELECT *s) and verify
//      current_password against it with bcrypt.compare BEFORE accepting the
//      new password. This is the re-authentication step per project
//      decision — a valid access token alone is not sufficient to change a
//      password; the user must also prove they still know the current one.
//
//   2. After a successful password change specifically (not a name-only
//      change), revoke every refresh token for this user via
//      revokeAllUserTokens — including the one belonging to the CURRENT
//      session, per project decision. No session-exclusion logic is
//      introduced; the current session's still-valid access token (up to
//      15 minutes remaining) is the deliberate grace period, not a special
//      case carved out in this function.
//
// A name-only update never touches bcrypt or the refresh_tokens table at
// all — both of those blocks are conditioned on `password !== undefined`.
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, password, current_password } = req.body;

    const fieldsToUpdate = {};

    if (name !== undefined) {
      fieldsToUpdate.name = name;
    }

    if (password !== undefined) {
      // findUserById excludes the password column by design (see its own
      // comment) — re-fetch via findUserByEmail's SELECT * to get the hash
      // needed for verification. req.user.email comes from the JWT payload,
      // which is always kept in sync with the user's current email.
      const userWithPassword = await findUserByEmail(req.user.email);

      if (!userWithPassword) {
        return fail(res, "User not found", [], 404);
      }

      const isMatch = await bcrypt.compare(current_password, userWithPassword.password);
      if (!isMatch) {
        return fail(res, "Current password is incorrect", [], 401);
      }

      fieldsToUpdate.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await updateUser(userId, fieldsToUpdate);

    if (!updatedUser) {
      return fail(res, "User not found", [], 404);
    }

    // Only revoke sessions when password actually changed — a name-only
    // update has no security implication and should not log anyone out.
    if (password !== undefined) {
      await revokeAllUserTokens(userId);
    }

    return success(res, { user: updatedUser }, "Profile updated successfully", 200);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
  updateProfile,
};