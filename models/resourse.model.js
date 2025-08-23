const mongoose = require("mongoose");
const randomUUID = require("crypto").randomUUID;

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource Title is Required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "Description not Provided for the Resource",
    },
    type: {
      type: String,
      enum: {
        values: [
          "lecture_notes",
          "assignment",
          "previous_papers",
          "reference",
          "videos",
          "images",
        ],
        message: "Invalid Resource Type",
      },
      default: "lecture_notes",
    },
    subject: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subjects",
        required: true,
      },
      code: { type: String, required: true },
    },
    file: {
      name: String,
      url: String,
      size: {
        type: Number,
        max: [104857600, "File size cannot exceed more than 100MB"],
        default: 0,
      },
      mimetype: {
        type: String,
        default: "MimeType not Entered",
      },
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "review", "published", "archived"],
      default: "draft",
    },
    approval: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvedAt: Date,
      approvalNotes: {
        type: String,
        maxlength: [
          500,
          "Approval Notes cannot exceed more than 500 characters",
        ],
        default: "Approval Notes not provided",
      },
    },
    visibility: {
      type: String,
      enum: ["public", "course_enrolled", "faculty_only"],
      default: "course_enrolled",
    },
    downloadAllowed: { type: Boolean, default: true },
    sharingAllowed: { type: Boolean, default: true },

    analytics: {
      viewCount: { type: Number, default: 0 },
      downloadCount: { type: Number, default: 0 },
      likeCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
      askedJosephine: { type: Number, default: 0 },
      lastAccessed: { type: Date, default: Date.now },
      usersAccessed: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          count: {
            type: Number,
            default: 1,
          },
          lastAccessed: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      usersDownloaded: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          count: {
            type: Number,
            default: 1,
          },
          lastDownload: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    relatedResources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        commentId: {
          type: String,
          default: () => randomUUID(),
        },
        content: {
          type: String,
          required: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        timestamp: { type: Date, default: Date.now },
        likes: { type: Number, default: 0 },
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            content: {
              type: String,
              maxlength: [500, "Comment Reply cannot exceed 500 characters"],
            },
            timestamp: { type: Date, default: Date.now },
          },
        ],
      },
    ],
    version: { type: Number, default: 1 },
    previousVersions: [
      {
        version: Number,
        url: String,
        uploadedAt: Date,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
ResourceSchema.index({ "subject.id": 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ status: 1 });
ResourceSchema.index({ visibility: 1 });
ResourceSchema.index({ uploadedBy: 1 });
ResourceSchema.index({ createdAt: -1 });

// Virtuals
ResourceSchema.virtual("subjectName").get(function () {
  if (this.populated("subject.id") && this.subject.id) {
    const subjectDoc = this.subject.id;
    const subjectInfo = subjectDoc.getSubjectByCode(this.subject.code);
    return subjectInfo ? subjectInfo.name : "Unknown Subject";
  }
  return null;
});

// Methods
ResourceSchema.methods.getSubjectInfo = async function () {
  if (!this.populated("subject.id")) await this.populate("subject.id");

  const subjectDoc = this.subject.id;
  if (!subjectDoc) throw new Error("Subject document not found");
  const subjectInfo = subjectDoc.getSubjectByCode(this.subject.code);
  if (!subjectInfo) throw new Error(`Subject with code ${this.subject.code}`);

  return {
    id: subjectDoc._id,
    course: subjectDoc.course,
    department: subjectDoc.department,
    specialization: subjectDoc.specialization,
    year: subjectDoc.year,
    subjectName: subjectInfo.name,
    subjectCode: subjectInfo.code,
    semester: subjectInfo.semester,
  };
};

ResourceSchema.methods.updateStatus = async function (status) {
  const statuses = ["draft", "review", "published", "archived"];
  if (!statuses.includes(status)) throw new Error("Invalid Status Provided");
  this.status = status;
  if (status === "published") this.approval.approvedAt = new Date();
  return await this.save();
};

ResourceSchema.methods.updateVisibility = async function (visibility) {
  const visibilities = ["public", "course_enrolled", "faculty_only"];
  if (!visibilities.includes(visibility))
    throw new Error("Invalid Visibility Status Provided");
  this.visibility = visibility;
  return await this.save();
};

ResourceSchema.methods.updateViewCount = async function () {
  this.analytics.viewCount += 1;
  return await this.save();
};

ResourceSchema.methods.updateDownloadCount = async function () {
  this.analytics.downloadCount += 1;
  return await this.save();
};

ResourceSchema.methods.updateLikeCount = async function (number) {
  if (typeof number !== "number") throw new Error("Not A Valid Number");
  this.analytics.likeCount += number;
  if (this.analytics.likeCount < 0) this.analytics.likeCount = 0;
  return await this.save();
};

ResourceSchema.methods.updateShareCount = async function () {
  this.analytics.shareCount += 1;
  return await this.save();
};

ResourceSchema.methods.updateJosephineCount = async function () {
  this.analytics.askedJosephine += 1;
  return await this.save();
};

ResourceSchema.methods.updateUsersAccessed = async function (userId) {
  const existingUser = this.analytics.usersAccessed.find(
    (f) => f.user.toString() === userId.toString()
  );

  if (existingUser) {
    existingUser.count += 1;
    existingUser.lastAccessed = new Date();
  } else {
    this.analytics.usersAccessed.push({
      user: userId,
    });
  }
  this.analytics.lastAccessed = new Date();
  return await this.save();
};

ResourceSchema.methods.updateUsersDownloaded = async function (userId) {
  const existingUser = this.analytics.usersDownloaded.find(
    (f) => f.user.toString() === userId.toString()
  );

  if (existingUser) {
    existingUser.count += 1;
    existingUser.lastDownload = new Date();
  } else {
    this.analytics.usersDownloaded.push({
      user: userId,
    });
  }
  this.analytics.lastAccessed = new Date();
  return await this.save();
};

ResourceSchema.methods.updateLikesOnComment = async function (
  commentId,
  number
) {
  if (typeof number !== "number")
    throw new Error("Incorrect Number Provided for Likes");

  const existingComment = this.comments.find(
    (f) => f.commentId.toString() === commentId.toString()
  );

  if (!existingComment) throw new Error("Comment does not exist");

  existingComment.likes += number;

  if (existingComment.likes < 0) existingComment.likes = 0;

  return await this.save();
};

ResourceSchema.methods.addComment = async function (userId, content) {
  this.comments.push({
    user: userId,
    content,
  });
  return await this.save();
};

ResourceSchema.methods.addReplyToComment = async function (
  commentId,
  userId,
  content
) {
  const existingComment = this.comments.find(
    (f) => f.commentId.toString() === commentId.toString()
  );

  if (!existingComment) throw new Error("Comment Does Not Exist");

  existingComment.replies.push({
    user: userId,
    content,
  });
  return await this.save();
};

ResourceSchema.methods.deleteComment = async function (commentId) {
  this.comments = this.comments.filter(
    (comment) => comment.commentId.toString() !== commentId.toString()
  );
  return await this.save();
};

ResourceSchema.methods.editComment = async function (commentId, newContent) {
  const existingComment = this.comments.find(
    (f) => f.commentId.toString() === commentId.toString()
  );

  if (!existingComment) throw new Error("Comment does not exist");

  existingComment.content = newContent;
  return await this.save();
};

ResourceSchema.methods.approve = async function (approvedBy, notes = "") {
  this.approval.approvedBy = approvedBy;
  this.approval.approvedAt = new Date();
  this.approval.approvalNotes = notes;
  this.status = "published";
  return await this.save();
};

ResourceSchema.methods.createVersion = async function (reason, newFileUrl) {
  this.previousVersions.push({
    version: this.version,
    url: this.file.url,
    uploadedAt: new Date(),
    reason: reason,
  });

  this.version += 1;
  this.file.url = newFileUrl;

  return await this.save();
};

// Statics
ResourceSchema.statics.findBySubject = function (subjectId) {
  return this.find({ "subject.id": subjectId });
};

ResourceSchema.statics.findByType = function (type) {
  return this.find({ type });
};

ResourceSchema.statics.findPublished = function () {
  return this.find({ status: "published" });
};

ResourceSchema.statics.findByVisibility = function (visibility) {
  return this.find({ visibility });
};

ResourceSchema.statics.findByUploader = function (userId) {
  return this.find({ uploadedBy: userId });
};

ResourceSchema.statics.findPopular = function (limit = 10) {
  return this.find({ status: "published" })
    .sort({
      "analytics.viewCount": -1,
      "analytics.downloadCount": -1,
      "analytics.likeCount": -1,
    })
    .limit(limit);
};

ResourceSchema.statics.findRecent = function (limit = 10) {
  return this.find({ status: "published" })
    .sort({ createdAt: -1 })
    .limit(limit);
};

ResourceSchema.statics.getResourceStats = async function () {
  return await this.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalViews: { $sum: "$analytics.viewCount" },
        totalDownloads: { $sum: "$analytics.downloadCount" },
      },
    },
  ]);
};

module.exports = mongoose.model("Resource", ResourceSchema);
