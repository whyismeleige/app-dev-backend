const dbConnect = require("../../database/dbConnect");
const db = require("../../models");
const User = db.user;
const Attendance = db.attendance;
const NewAttendance = db.newAttendance;

dbConnect();

const convertData = async () => {
  const allAttendance = await Attendance.find({});
  for (let userAttendance of allAttendance) {
    const user = await User.findOne({
      "academic.studentId": String(userAttendance.id),
    });
    const newUserAttendance = new NewAttendance({
      student: user._id,
      studentId: String(userAttendance.id),
      scrapedAttendance: userAttendance.data,
      semDetails: {
        semester: user.academic.semester,
        startDate: new Date("2025-06-11"),
        endDate: new Date("2025-10-15"),
        lastDateOfAttendance: new Date("2025-09-20"),
      },
    });
    await newUserAttendance
      .save()
      .then(() => console.log("Saved Successfully"))
      .catch((error) => console.error("Error While Saving", error));
  }
};

convertData();
