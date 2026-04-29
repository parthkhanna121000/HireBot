// const mongoose = require("mongoose");

// const blacklistTokenSchema = new mongoose.Schema(
//   {
//     token: {
//       type: String,
//       required: [true, "token is required to be added in blacklist"],
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// const tokenBlacklistModel = mongoose.model(
//   "blacklistTokens",
//   blacklistTokenSchema,
// );

// module.exports = tokenBlacklistModel;

const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      index: true, // fast lookups on every request
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  },
);

/**
 * TTL index — MongoDB automatically deletes blacklisted tokens
 * after 7 days (604800 seconds), matching the JWT expiry.
 * This prevents the blacklist collection from growing forever.
 */
blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

const tokenBlacklistModel = mongoose.model(
  "blacklistTokens",
  blacklistTokenSchema,
);

module.exports = tokenBlacklistModel;
