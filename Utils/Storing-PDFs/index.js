const fs = require("fs");
const path = require("path");
const { Storage, File } = require("megajs");
const { webcrypto } = require("crypto");

if (!globalThis.crypto) globalThis.crypto = webcrypto;

require("dotenv").config();
const dbConnect = require("../../database/dbConnect");
const PDF = require("../../models").pdf;

const dirPath = `${__dirname}/pdfs`;
dbConnect();

const EMAIL_ID = process.env.EMAIL_ID;
const MEGA_PWD = process.env.MEGA_PWD;

const storage = new Storage({
  email: EMAIL_ID,
  password: MEGA_PWD,
});

// File Download from Mega
const downloadFile = (url) => {
  const file = File.fromURL(url);

  file.loadAttributes((err, file) => {
    if (err) throw err;

    console.log("File Name:", file.name);
    console.log("File size:", file.size);

    const downloadStream = file.download();
    const writeStream = fs.createWriteStream(`./${file.name}`);

    downloadStream.pipe(writeStream);

    downloadStream.on("end", () => {
      console.log(`Download Completed!`);
    });

    downloadStream.on("error", (err) => {
      console.error("Download Error:", err);
    });
  });
};

// File Upload to Mega
const handleUpload = async () => {
  try {
    const directories = fs.readdirSync(dirPath);

    for (let directory of directories) {
      const filesPath = path.join(dirPath, directory);
      const files = fs.readdirSync(filesPath);
      let units = [];
      for (const file of files) {
        const filePath = path.join(filesPath, file);

        await new Promise((resolve, reject) => {
          const upload = storage.upload({
            name: file,
            size: fs.statSync(filePath).size,
          });

          fs.createReadStream(filePath).pipe(upload);

          upload.on("complete", async (uploadedFile) => {
            try {
              const link = await uploadedFile.link();
              console.log(`✅ Uploaded: ${file}`);
              console.log(`🔗 Link: ${link}`);

              units.push({ fileName: file, pdfUrl: link });

              resolve();
            } catch (err) {
              console.error(`❌ Link error for ${file}:`, err);
              reject(err);
            }
          });

          upload.on("error", (err) => {
            console.error(`❌ Upload error for ${file}:`, err);
            reject(err);
          });
        });
      }
      const newPDF = await PDF.create({
        subjectName: directory,
        units
      });
      await newPDF.save();
    }
  } catch (err) {
    console.error("❌ Top-Level Error:", err);
  }
};

storage.on("ready", handleUpload);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
