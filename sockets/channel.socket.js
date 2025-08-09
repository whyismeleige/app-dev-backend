const db = require("../models");

const Channel = db.channel;
const User = db.user;

module.exports = (io, socket) => {
  socket.on("joinChannel", async ({ channelId, userId }) => {
    socket.join(channelId);
    await Channel.findByIdAndUpdate(channelId, { $inc: { memberCount: 1 } });
    console.log(`User ${userId} joined channel ${channelId}`);
  });

  socket.on("leaveChannel", async ({ channelId, userId }) => {
    socket.leave(channelId);
    await Channel.findByIdAndUpdate(channelId, { $inc: { memberCount: -1 } });
    console.log(`User ${userId} left channel ${channelId}`);
  });

  socket.on("typing", async ({ channelId, userId }) => {
    const user = await User.findById({ _id: userId });
    socket
      .to(channelId)
      .emit("userTyping", { channelId,userId, userName: user.nickname });
  });
};
