const db = require("../models");
const PDF = db.pdf;
const mega = require("megajs");
const mime = require('mime-types');
require("dotenv").config();

exports.getMaterials = async (req, res) => {
  const { subject } = req.body;
  try {
    const data = await PDF.findOne({ subject });
    if (!data) {
      return res.status(404).send({
        message: "Data not found for Subjects",
      });
    }
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getFile = async (req, res) => {
  const { fileURL } = req.body;
  if (!fileURL || !fileURL.includes("#")) {
    return res.status(400).send({
      message: "Valid FileURL required to stream file",
    });
  }

  try {
    const file = mega.File.fromURL(fileURL);

    file.loadAttributes((err) => {
      if (err) {
        console.error("Error loading file attributes:", err);
        return res.status(500).send({
          message: "Server Error while Getting Data",
        });
      }

      const mimeType = mime.lookup(file.name) || "application/octet-stream";

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.name}"`
      );
      res.setHeader("Content-Type", mimeType);

      const downloadStream = file.download();

      downloadStream.on("error", (err) => {
        console.error("Download Stream error: ", err);
        res.status(500).send({
          message: "Server Error",
        });
      });
      console.log('Successfully sent FILE to User');
      downloadStream.pipe(res);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Server Error",
    });
  }
};
