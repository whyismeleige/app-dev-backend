const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    required: true,
  },
  serverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Server",
    default: null,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: {
    type: String,
    trim: true,
    default: "User"
  },
  avatar: {
    type: String,
    default: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  editedTimestamp: {
    type: Date,
    default: null,
  },
  mentionEveryone: {
    type: Boolean,
    default: false,
  },
  mentions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  mentionRoles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
});

module.exports = mongoose.model("Message", messageSchema,'messages');
