const mongoose = require("mongoose");
const ChannelTypes = require("./constants/channelTypes");

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    type: {
      type: Number,
      required: true,
      enum: Object.values(ChannelTypes),
      default: 0,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    icon: {
      type: String,
      default: "https://img.icons8.com/?size=80&id=5PtVOL9WxAgg&format=png",
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    bitrate: {
      type: Number,
      default: 64000,
      min: 8000,
      max: 384000,
    },
    rateLimitPerUser: {
      type: Number,
      default: 0,
      min: 0,
      max: 21600,
    },
    lastPinTimestamp: {
      type: Date,
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

channelSchema.virtual('messages',{
  ref: 'Message',
  localField: '_id',
  foreignField: 'channelId'
})

const Channel = mongoose.model("Channel",channelSchema,'channels');

module.exports = Channel;
