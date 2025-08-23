const mongoose = require("mongoose");

const ScrapedAttendanceSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, "Require a Subject"],
    trim: true,
    minlength: [1, "Subject name cannot be empty"],
  },
  workingDays: {
    type: Number,
    required: [true, "Working Days is required"],
    min: [0, "Working days cannot be negative"],
    validate: {
      validator: Number.isInteger,
      message: "Working Days must be a whole number",
    },
  },
  daysPresent: {
    type: Number,
    required: [true, "Days present is required"],
    min: [0, "Days present cannot be negative"],
    validate: [
      {
        validator: Number.isInteger,
        message: "Days present must be a whole number",
      },
      {
        validator: function (value) {
          return value <= this.workingDays;
        },
        message: "Days present cannot exceed working days",
      },
    ],
  },
  daysAbsent: {
    type: Number,
    required: [true, "Days absent is required"],
    min: [0, "Days absent cannot be negative"],
    validate: [
      {
        validator: Number.isInteger,
        message: "Days absent must be a whole number",
      },
      {
        validator: function (value) {
          return this.daysPresent + value === this.workingDays;
        },
        message: "Days present + days absent must equal working days",
      },
    ],
  },
  percentage: {
    type: Number,
    required: [true, "Percentage is required"],
    min: [0, "Percentage cannot be negative"],
    max: [100, "Percentage cannot exceed 100"],
  },
});

const ManualAttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "Date is required"],
    validate: {
      validator: function (value) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return value <= today;
      },
      message: "Date cannot be in the future",
    },
  },
  status: {
    type: String,
    enum: ["present", "absent", "holiday", "exam", "not_entered"],
    default: function () {
      const entryDate = new Date(this.date);
      if (
        !this.isNaN(entryDate.getTime()) &&
        (entryDate.getDay() === 0 || entryDate.getDay() === 6)
      ) {
        return "holiday";
      }
      return "not_entered";
    },
  },
  notes: {
    type: String,
    maxlength: 200,
    trim: true,
  },
  enteredAt: {
    type: Date,
    default: Date.now,
  },
});

const SemDetailsSchema = new mongoose.Schema({
  semester: {
    type: String,
    required: [true, "Semester is Required"],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, "Starting Date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "Ending Date is required"],
    validate: {
      validator: function (value) {
        return value > this.startDate;
      },
      message: "Ending Date must be after Starting Date",
    },
  },
  lastDateOfAttendance: {
    type: Date,
    validate: {
      validator: function (value) {
        if (!value) return true;
        return value >= this.startDate && value <= this.endDate;
      },
      message: "Last attendance date must be within semester dates",
    },
  },
});

const AttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      unique: [true, "Student ID needs to be unique"],
      required: [true, "Please Provide an ID"],
    },
    scrapedAttendance: [ScrapedAttendanceSchema],
    lastScraped: {
      type: Date,
      default: Date.now,
    },
    manualEntries: [ManualAttendanceSchema],
    lastEntried: {
      type: Date,
      default: Date.now,
    },
    semDetails: SemDetailsSchema,
    pastSemData: [
      {
        scrapedAttendance: [ScrapedAttendanceSchema],
        manualEntries: [ManualAttendanceSchema],
        semDetails: SemDetailsSchema,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes

// Methods
AttendanceSchema.methods.saveScrapedData = async function (data) {
  this.scrapedAttendance = [...data];
  this.lastScraped = new Date();
  return await this.save();
};

AttendanceSchema.methods.saveManualEntry = async function ({
  date,
  status,
  notes = "",
}) {
  if (!date || !status)
    throw new Error("Date and status are required for entry");

  const entryDate = new Date(date);

  const existingEntry = this.manualEntries.find(
    (entry) => new Date(entry.date).toDateString() === entryDate.toDateString()
  );
  if (existingEntry) {
    existingEntry.status = status;
    existingEntry.notes = notes;
    existingEntry.enteredAt = new Date();
  } else {
    this.manualEntries.push({ date: entryDate, status, notes });
  }
  this.lastEntried = new Date();
  return await this.save();
};

AttendanceSchema.methods.deleteManualEntry = async function (date) {
  const entryDate = new Date(date);
  this.manualEntries = this.manualEntries.filter(
    (entry) => new Date(entry.date).toDateString() !== entryDate.toDateString()
  );
  this.lastEntried = new Date();
  return await this.save();
};

AttendanceSchema.methods.getScrapedAttendanceSummary = function () {
  let totalPresentClasses = 0,
    totalWorkingClasses = 0;
  this.scrapedAttendance.forEach((entry) => {
    totalWorkingClasses += entry.workingDays;
    totalPresentClasses += entry.daysPresent;
  });
  const attendancePercentage =
    totalWorkingClasses > 0
      ? (totalPresentClasses / totalWorkingClasses) * 100
      : 0;

  return {
    totalWorkingClasses,
    totalPresentClasses,
    totalAbsentClasses: totalWorkingClasses - totalPresentClasses,
    attendancePercentage: Math.round(attendancePercentage),
  };
};

AttendanceSchema.methods.getManualAttendanceSummary = function () {
  const presentDays = this.manualEntries.filter(
    (entry) => entry.status === "present"
  ).length;

  const workingDays = this.manualEntries.filter(
    (entry) => entry.status !== "holiday"
  ).length;

  const attendancePercentage =
    workingDays > 0 ? (presentDays / workingDays) * 100 : 0;

  return {
    workingDays,
    presentDays,
    absentDays: workingDays - presentDays,
    attendancePercentage: Math.round(attendancePercentage),
  };
};

AttendanceSchema.methods.getAttendanceByDateRange = function (
  startDate,
  endDate
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return this.manualEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= start && entryDate <= end;
  });
};

AttendanceSchema.methods.getMonthlyAttendance = function (year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return this.getAttendanceByDateRange(startDate, endDate);
};

AttendanceSchema.methods.getAttendanceStreak = function () {
  const sortedEntries = this.manualEntries
    .filter((entry) => entry.status !== "holiday" && entry.status !== "exam")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let currentStreak = 0,
    longestStreak = 0;

  for (let entry of sortedEntries) {
    currentStreak = entry.status === "present" ? currentStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return {
    currentStreak,
    longestStreak,
  };
};

// Statics
AttendanceSchema.statics.findByStudentId = function (studentId) {
  return this.findOne({ studentId }).populate("student");
};

AttendanceSchema.statics.findBySemester = function (semester) {
  return this.find({ "semDetails.semester": semester }).populate("student");
};

AttendanceSchema.statics.updateSemDates = function ({
  startDate,
  endDate,
  lastAttendanceDate,
}) {
  return this.updateMany(
    {},
    {
      $set: {
        "semDetails.startDate": startDate,
        "semDetails.endDate": endDate,
        "semDetails.lastDateOfAttendance": lastAttendanceDate,
      },
    }
  );
};

AttendanceSchema.statics.findStudentsNeedingAttention = function () {
  return this.find({
    $or: [
      { "manualEntries.status": { $size: 0 } },
      { scrapedAttendance: { $size: 0 } },
      { lastEntried: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    ],
  }).populate("student");
};

// Pre Save Middleware
AttendanceSchema.pre("save", function (next) {
  if (
    this.semDetails &&
    this.semDetails.endDate &&
    this.semDetails.endDate <= new Date()
  ) {
    this.pastSemData.push({
      scrapedAttendance: [...this.scrapedAttendance],
      manualEntries: [...this.manualEntries],
      semDetails: { ...this.semDetails.toObject() },
    });
    this.scrapedAttendance = [];
    this.manualEntries = [];
    this.semDetails = new SemDetailsSchema({
      semester: undefined,
      startDate: undefined,
      endDate: undefined,
      lastDateOfAttendance: undefined,
    });
  }
  next();
});

module.exports = mongoose.model("NewAttendance", AttendanceSchema);
