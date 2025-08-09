const db = require("../models");

const Message = db.message;
const Channel = db.channel;
const User = db.user;

module.exports = (io, socket) => {
  socket.on(
    "sendMessage",
    async ({ channelId, userId, avatar, content, attachment }) => {
      const user = await User.findById({ _id: userId });

      const newMessage = await Message.create({
        channelId,
        authorId: userId,
        authorName: user.nickname,
        avatar,
        content,
      });

      await Channel.findByIdAndUpdate(channelId, {
        lastMessageId: newMessage._id,
        $inc: { messageCount: 1 },
      });

      io.to(channelId).emit("newMessage", newMessage);
    }
  );
};
