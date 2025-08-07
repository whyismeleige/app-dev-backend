const mongoose = require("mongoose");

const PDF = mongoose.model(
  "PDFs",
  new mongoose.Schema({
    subject: String,
    units: [
      {
        fileName: String,
        pdfUrl: String,
      },
    ],
  })
);

module.exports = PDF;