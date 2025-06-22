const mongoose = require("mongoose");

const PDF = mongoose.model(
  "pdfs",
  new mongoose.Schema({
    subjectName: String,
    units: [
      {
        fileName: String,
        pdfUrl: String,
      },
    ],
  })
);

module.exports = PDF;
