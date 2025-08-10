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
  }),'pdfs'
);

module.exports = PDF;