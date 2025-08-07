const mongoose = require("mongoose");
const dbConnect = require("../../database/dbConnect");
const db = require("../../models");

dbConnect();

const Subjects = db.subjects;

const UniqueSubjects = mongoose.model(
  "unique_subjects",
  new mongoose.Schema({
    subject: {
      type: String,
      unique: true,
    },
  })
);

(async () => {
  try {
    const allEntries = await Subjects.find({});
    const subjectSet = new Set();

    for (const entry of allEntries) {
      const semesters = entry.data;
      if (!semesters) continue;

      for (const subjectsList of semesters) {
        if (Array.isArray(subjectsList)) {
          for (const subject of subjectsList[1]) {
            subjectSet.add(subject.trim().toUpperCase());
          }
        }
      }
    }

    const subjectArray = Array.from(subjectSet).map((subject) => ({ subject }));

    // Optional: Clear old data
    await UniqueSubjects.deleteMany({});

    // Insert new unique subjects
    await UniqueSubjects.insertMany(subjectArray);

    console.log(`✅ Inserted ${subjectArray.length} unique subjects.`);
  } catch (error) {
    console.error("❌ Error:", error);
  } 
})();
