const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    nickname: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 100,
      default: "College Student",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["online", "idle", "dnd", "invisible", "offline"],
      default: "offline",
    },
    bio: {
      type: String,
      maxlength: 190,
      default: "",
    },
    friends: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "blocked"],
          default: "pending",
        },
        since: { type: Date, default: Date.now },
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    ],
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    servers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.virtual("isOnline").get(function () {
  return this.status !== "offline" && this.status !== "invisible";
});

const User = mongoose.model("User", UserSchema, "users");

module.exports = User;
