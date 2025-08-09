const messageSocket = require("./message.socket");
const channelSocket = require("./channel.socket");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A User connected");

    messageSocket(io, socket);
    channelSocket(io, socket);
  });
};
