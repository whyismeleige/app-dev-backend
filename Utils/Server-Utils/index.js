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

const createUsers = async () => {
  const Students = db.student;
  const Server = db.server;
  const User = db.user;
  const studentsData = await Students.find({});
  studentsData.forEach(async (student) => {
    const course = `${student.dept} ${student.specialization}`;
    try {
      const serverID = await Server.findOne({
        course,
        year: student.year,
      });
      const newUser = {
        username: student.name,
        nickname: student.name,
        email: student.email,
        avatar: getAvatar(),
        servers: [serverID],
      };
      await new User(newUser).save();
    } catch (error) {
      console.error("Error while Inserting New User", error);
    }
  });
};

createUsers();
