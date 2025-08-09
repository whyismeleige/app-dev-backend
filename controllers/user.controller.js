const db = require("../models");
require("dotenv").config();

exports.getSemesters = async (req, res) => {
  const { dept, specialization, year } = req.body;
  const subjects = db.mongoose.connection.collection("subjects");
  try {
    const subjectsData = await subjects
      .find({ dept, specialization, year })
      .toArray();
    if (!subjectsData) {
      return res.status(400).send({
        message: "Course Does Not Exist",
      });
    }
    res.status(200).send(subjectsData);
  } catch (error) {
    res.status(500).send({ message: "Server Error" });
    console.error(error);
  }
};

exports.getAttendanceData = async (req, res) => {
  const { id } = req.body;
  const Attendance = db.attendance;
  try {
    const userAttendance = await Attendance.findOne({ id });
    if (!userAttendance) {
      return res.status(400).send({
        message: "User Does Not Exist",
      });
    }
    const { data } = userAttendance.toObject();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: "Server Error" });
    console.error(error);
  }
};

exports.getHolidays = async (req, res) => {
  try {
    const url = "https://api.11holidays.com/v1/holidays?country=IN&year=2025";
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error in fetching holidays data");
  }
};
