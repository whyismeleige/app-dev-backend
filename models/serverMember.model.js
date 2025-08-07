const mongoose = require("mongoose");

const serverMemberSchema = new mongoose.Schema(
  {
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nickname: {
      type: String,
      maxlength: 32,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    deaf: {
      type: Boolean,
      default: false,
    },
    mute: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

serverMemberSchema.virtual("displayName").get(function () {
  return this.nickname || this.user?.username || "Unknown User";
});

module.exports = mongoose.model("Server Member", serverMemberSchema);
