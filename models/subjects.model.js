const mongoose = require("mongoose");
const randomUUID = require("crypto").randomUUID;

const SubjectsSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Map,
      of: [{ name: String, code: String }],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

SubjectsSchema.methods.getSubjectByCode = function (subjectCode) {
  for (const [key, subjects] of this.data.entries()) {
    const foundSubject = subjects.find(
      (subject) => subject.code === subjectCode
    );
    if (foundSubject) {
      return {
        semester: key,
        name: foundSubject.name,
        code: foundSubject.code,
      };
    }
  }
  return null;
};

SubjectsSchema.methods.getAllSubjects = function () {
  return this.data;
};

module.exports = mongoose.model("Subjects", SubjectsSchema);
