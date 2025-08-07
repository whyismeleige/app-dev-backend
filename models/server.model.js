const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 120,
      default: "Server Description Not Entered",
    },
    icon: {
      type: String,
      default: "https://img.icons8.com/ios-filled/100/university.png",
    },
    banner: {
      type: String,
      default: "",
    },
    class: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3,
    },
    leaders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    ],
    afkChannelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },
    afkTimeout: {
      type: Number,
      default: 300,
      min: 60,
      max: 3600,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

serverSchema.virtual('channels',{
  ref: 'Channel',
  localField: '_id',
  foreignField: 'serverId'
})

serverSchema.virtual('members',{
  ref: 'Server Member',
  localField: '_id',
  foreignField: 'serverId'
})

serverSchema.virtual('roles',{
  ref: 'Role',
  localField: '_id',
  foreignField: 'serverId'
})


const Server = mongoose.model("Server", serverSchema, "server");

module.exports = Server;
