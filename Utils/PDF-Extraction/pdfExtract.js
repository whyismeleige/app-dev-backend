const fs = require("fs");
const pdfParse = require("pdf-parse");
const romanNo = ["I", "II", "III", "IV"];

const extractText = async (pdfFile, courseName) => {
  console.log(courseName);
  console.log(pdfFile);
  const dataBuffer = fs.readFileSync(pdfFile);
  const data = await pdfParse(dataBuffer);
  const rawText = data.text.trim();
  const textBlock = rawText.split(
    /I\n|II\n|III\n|IV\n|V\n|VI\n|CUMULATIVE GRADE REPORT\n/
  );
  const semesters = [];
  for (let i = 1; i < textBlock.length - 1; i++) {
    const lines = textBlock[i].split(/\n/);
    let subjects = lines.map((line) => {
      line.replaceAll(".", "-");
      const details = line.split(/-22T|-22TP/);
      if (details[1]) return details[1].split(/5|4|2/)[0];
      else return null;
    });
    subjects = subjects.filter((subject) => subject !== null);
    semesters.push(subjects);
  }
  for (let i = 0; i < 4; i++) {
    if (semesters[i].length < 5) continue;
    const courseDetails = courseName.split(/[/]/);
    const deptDetails = courseDetails[1].split(/[-]/);
    let object = {
      semester: `Semester ${romanNo[i]}`,
      course: courseDetails[1],
      dept: deptDetails[0].trim(),
      specialization: deptDetails[1].trim(),
    };
    semesters[i].forEach((subject, index) => {
      object[`subject_${index + 1}`] = subject.trim();
    });
    await fetch('http://localhost:8080/subject',{
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(object)
    })
  }
};

module.exports = extractText;
