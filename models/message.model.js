const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // type: {
    //   value: String,
    //   enum: ["text", "image", "file", "embed", "system", "reply"],
    //   default: "text",
    // },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
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
    reactions: [
      {
        emoji: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Emoji",
        },
        users: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            time: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        contentType: String,
      },
    ],
    embeds: [
      {
        title: String,
        descriptiong: String,
        url: String,
        color: String,
        thumbnail: String,
        image: String,
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes

// Virtuals
messageSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

messageSchema.virtual("channel", {
  ref: "Channel",
  localField: "channelId",
  foreignField: "_id",
  justOne: true,
});

messageSchema.virtual("server", {
  ref: "Server",
  localField: "serverId",
  foreignField: "_id",
  justOne: true,
});

// Methods
messageSchema.methods.addReaction = async function (emojiId, userId) {
  const exisitingReaction = this.reactions.find(
    (r) => r.emoji.toString() === emojiId.toString()
  );

  if (exisitingReaction) {
    if (!exisitingReaction.users.includes({ userId })) {
      exisitingReaction.users.push({ userId });
      exisitingReaction.count += 1;
    }
  } else {
    this.reactions.push({
      emoji: emojiId,
      users: [{ userId }],
    });
  }

  return await this.save();
};

messageSchema.methods.removeReaction = async function (emojiId, userId) {
  const reactionIndex = this.reactions.findIndex(
    (r) => r.emoji.toString() === emojiId.toString()
  );

  if (reactionIndex !== -1) {
    const reaction = this.reactions[reactionIndex];
    const userIndex = reaction.users.indexOf({ userId });

    if (userIndex !== -1) {
      reaction.users.splice(userIndex, 1);
      reaction.count -= 1;

      if (reaction.count === 0) this.reactions.splice(reactionIndex, 1);
    }
  }

  return await this.save();
};

messageSchema.methods.togglePin = async function () {
  this.pinned = !this.pinned;
  return await this.save();
}

// Statics

module.exports = mongoose.model("Message", messageSchema, "messages");
