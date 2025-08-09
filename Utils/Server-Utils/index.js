const dbConnect = require("../../database/dbConnect");
const db = require("../../models");

dbConnect();

const styles = [
  "adventurer",
  "avataaars",
  "big-ears",
  "big-smile",
  "croodles",
  "dylan",
  "lorelei",
  "micah",
  "miniavs",
  "notionists",
  "open-peeps",
  "personas",
  "pixel-art",
];

const getAvatar = () => {
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const randomSeed = Math.random().toString(36).substring(2, 15);
  return `https://api.dicebear.com/8.x/${randomStyle}/svg?seed=${randomSeed}`;
};

const getUsers = async () => {
  const SERVER = db.server;
  const Channel = db.channel;
  const allServers = await SERVER.find({});
  allServers.forEach(async (server) => {
    const announcementChannel = {
      name: 'announcements',
      type: 5,
      serverId: server._id,
    }
    const textChannel = {
      name: 'group-chat',
      type: 0,
      serverId: server._id,
    }
    const voiceChannel = {
      name: 'voice-channel',
      type: 2,
      serverId: server._id
    }
    await new Channel(announcementChannel).save();
    await new Channel(textChannel).save();
    await new Channel(voiceChannel).save();
  })
};

getUsers();
