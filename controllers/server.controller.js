const db = require("../models");
require("dotenv").config();

const User = db.user;
const Server = db.server;
const Channel = db.channel;
const ServerMember = db.serverMember;

exports.getUser = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        message: "User does not exist",
      });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error("Error in Getting User Id", error);
    res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getServers = async (req, res) => {
  const { userId } = req.body;
  try {
    const memberships = await ServerMember.find({ userId }).populate({
      path: "serverId",
      populate: [
        { path: "channels", populate: [{ path: "messages" }] },
        { path: "members" },
      ],
    });

    const servers = memberships.map((membership) => membership.serverId);
    res.status(200).send(servers);
  } catch (error) {
    console.error("Error in Fetching Server Data", error);
    res.status(500).send({
      message: "Server Error",
    });
  }
};
