const mongoose = require("mongoose");

const Subjects = mongoose.model(
  "Subjects",
  new mongoose.Schema({
    course: String,
    dept: String,
    specialization: String,
    year: String,
    data: { type: Map, of: [String], required: true },
  }),'subjects'
);

module.exports = Subjects;