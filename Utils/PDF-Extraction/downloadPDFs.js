const https = require("https");
const fs = require("fs-extra");
const PdfParse = require("pdf-parse");

const downloadPDF = (pdfUrl) =>
  new Promise((resolve, reject) => {
    const fileUrl = pdfUrl;
    const destination = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

    const file = fs.createWriteStream(destination);

    https
      .get(fileUrl, (res) => {
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => console.log("File Downloaded Successfully"));
          resolve(destination);
        });
      })
      .on("error", (err) => {
        fs.unlink(destination, () => {
          console.error("Error Downloading file: ", err);
          reject(err);
        });
      });
  });

const moveFile = (path, destination) =>
  new Promise((resolve, reject) => {
    const src = destination;
    const dest = `${path}/${destination}`;

    fs.move(src, dest, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`File successfully moved!!`);
        resolve();
      }
    });
  });

const containsText = (file) =>
  new Promise(async (resolve) => {
    const dataBuffer = fs.readFileSync(file);
    const data = await PdfParse(dataBuffer);
    const rawText = data.text.trim();
    if (rawText.length > 100) {
      console.log(`There is Sufficient text in this pdf.`);
      resolve(true);
    } else {
      console.log(`There is no text in this pdf`);
      resolve(false);
    }
  });

const getPDF = async (directory, pdfLinks) => {
  const path = `../CourseWork-Files/${directory}`;
  for (let i=1;i<pdfLinks.length;i++) {
    const file = await downloadPDF(pdfLinks[i]);
    const isPDF = await containsText(file);
    if (isPDF) await moveFile(path, file);
    else fs.unlinkSync(file);
  }
};

module.exports = getPDF;
