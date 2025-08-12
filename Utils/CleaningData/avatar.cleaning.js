const dbConnect = require("../../database/dbConnect");
const db = require("../../models");
const User = db.user;
const Member = db.serverMember;

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

const cleanAvatars = async () => {
  const users = await User.find({});

  for (const user of users) {
    const avatar = user.avatar;
    const userId = user._id;
    console.log(user.avatar);
    const member = await Member.findOneAndUpdate({userId}, { avatar },{new: true});
    console.log(member.avatar);
  }
  console.log('Saved Successfully');
};

const fetchData = async (url) => {
  const response = await fetch(url);
  return response.status;
};

cleanAvatars();
