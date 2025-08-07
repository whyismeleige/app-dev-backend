const mongoose = require("mongoose");

const Channel = mongoose.model(
  "Channel",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 120,
      default: "",
    },
    type: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3, 4, 5],
      default: 0,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    userLimit: {
      type: Number,
      default: 0,
      min: 0,
      max: 99,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    icon:{
        type: String,
        default: null
    },
    leaders:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
  },{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  })
);

module.exports = Channel;