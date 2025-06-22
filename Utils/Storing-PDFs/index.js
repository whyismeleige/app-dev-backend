const fs = require("fs");
const dirPath = `${__dirname}/pdfs`;
const dbConnect = require("../../database/dbConnect");
const PDF = require("../../models").pdf;
const path = require("path");
const { Storage } = require("megajs");
const { webcrypto } = require("crypto");
const { File } = require("megajs");

if (!globalThis.crypto) globalThis.crypto = webcrypto;
require("dotenv").config();

const EMAIL_ID = process.env.EMAIL_ID;
const MEGA_PWD = process.env.MEGA_PWD;

const storage = new Storage({
  email: EMAIL_ID,
  password: MEGA_PWD,
});

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

// storage.on('ready', () => {
//   const file = 'evs.pdf';
//   const filePath = path.join(dirPath,file);
//   const upload = storage.upload({
//     name: 'example.pdf',
//     size: fs.statSync(filePath).size
//   })
//   fs.createReadStream(filePath).pipe(upload);

//   upload.on('complete', async (file) => {
//     const link = await file.link();
//     console.log('File uploaded to your account');
//     console.log('Download Link:',link);
//     downloadFile(link);
//   })

//   upload.on('error',err => {
//     console.error('Upload error:',err);
//   })
// })

const uploadPDF = (file, filePath) => {
  storage.on("ready", () => {
    const upload = storage.upload({
      name: file,
      size: fs.statSync(filePath).size,
    });

    fs.createReadStream(filePath).pipe(upload);

    let link;

    upload.on("complete", async (file) => {
      link = await file.link();
      console.log(`Download Link`, link);
    });

    upload.on("error", (err) => {
      console.error("Upload failed:", err);
    });

    return link;
  });
};

// const getPdfs = async () => {
//   try {
//     const directories = fs.readdirSync(dirPath);
//     console.log(directories);
//     for (let directory of directories) {
//       const filesPath = path.join(dirPath, directory);
//       const files = fs.readdirSync(filesPath);
//       for (const file of files) {
//         const filePath = path.join(filesPath, file);
//         const stats = fs.statSync(filePath);
//         const fileSize = stats.size / (1024 * 1024);
//         if (fileSize < 16) {
//           const contents = fs.readFileSync(filePath);
//           const newPdf = new PDF({
//             subjectName: directory,
//             fileName: file,
//             pdf: contents,
//           });
//           await newPdf.save();
//           console.log(`Saved Successfully`);
//         }
//       }
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };

// getPdfs();

const getPdfs = async () => {
  try {
    const directories = fs.readdirSync(dirPath);
    for (let directory of directories) {
      const filesPath = path.join(dirPath, directory);
      const files = fs.readdirSync(filesPath);
      let units = [];
      console.log(files);
      for (const file of files) {
        const filePath = path.join(filesPath, file);
        let link;
        storage.on("ready", () => {
          const upload = storage.upload({
            name: file,
            size: fs.statSync(filePath).size,
          });

          fs.createReadStream(filePath).pipe(upload);

          upload.on("complete", async (file) => {
            link = await file.link();
            console.log(`Download Link`, link);
          });

          upload.on("error", (err) => {
            console.error("Upload failed:", err);
          });

        });
        units.push({fileName:file,pdfUrl:link});
      }
      console.log(units);
      const newPdf = new PDF({
        subjectName: directory,
        units,
      });
      await newPdf.save();
      console.log(`Saved Successfully`);
    }
  } catch (error) {
    console.error(error);
  }
};

getPdfs();
