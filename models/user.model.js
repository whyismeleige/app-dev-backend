const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      lowercase: true,
      match: [/^[0-9]+@josephscollege.ac.in/, "Must use College Email"],
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
      minlength: [8, "Password must be at least 8 digits"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["student", "admin", "faculty", "alumni"],
        message: "Role must be student,admin,faculty or alumni",
      },
      default: "student",
    },
    phone: String,
    profile: {
      userName: {
        type: String,
        required: [true, "username is required"],
        trim: true,
        lowercase: true,
      },
      nickName: {
        type: String,
        trim: true,
        lowercase: true,
        default: "Student",
      },
      avatar: {
        type: String,
        default: "https://img.icons8.com/?size=48&id=kDoeg22e5jUY&format=png",
      },
      status: {
        type: String,
        enum: {
          values: ["online", "offline", "dnd", "invisible", "idle"],
          message: "Status must be defined",
        },
        default: "offline",
      },
      bio: {
        type: String,
        maxlength: 200,
        default: "",
      },
      friends: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          status: {
            type: String,
            enum: {
              values: [
                "outgoing",
                "incoming",
                "accepted",
                "rejected",
                "blocked",
              ],
              message: "Friend Request Status needs to be updated",
            },
            default: "outgoing",
          },
          since: { type: Date, default: Date.now },
        },
      ],
      blockedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      ],
      lastSeen: {
        type: Date,
        default: Date.now,
      },
      servers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Server",
        },
      ],
      messagesReported: [
        {
          message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
          },
          type: {
            type: String,
            enum: ["abusive", "not appropriate", "discriminative", "other"],
            default: "other",
          },
          content: {
            type: String,
            maxlength: [200, "Report cannot exceed more than 200 characters"],
          },
          reportTime: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      usersReported: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          type: {
            type: String,
            enum: ["abusive-behavior", "intolerant", "other"],
            default: "other",
          },
          content: {
            type: String,
            maxlength: [200, "Report cannot exceed more than 200 characters"],
          },
          reportTime: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    faculty: {
      facultyId: {
        type: String,
        unique: true,
        sparse: true,
      },
      dept: String,
      designation: String,
      subjectsTeaching: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
      ],
    },
    academic: {
      studentId: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^[0-9]{12}$/, "Student ID must be 12 digits"],
      },
      course: String,
      department: String,
      specialization: String,
      semester: String,
      year: String,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        enum: ["english", "hindi", "telugu"],
        default: "english",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        attendanceAlerts: { type: Boolean, default: true },
        gradeUpdates: { type: Boolean, default: true },
        resourceUpdates: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "college", "friends", "private"],
          default: "college",
        },
        contactVisibility: {
          type: String,
          enum: ["public", "friends", "private"],
          default: "friends",
        },
        activityVisibility: {
          type: String,
          enum: ["public", "friends", "private"],
          default: "private",
        },
      },
    },
    activity: {
      lastLogin: Date,
      totalLogins: { type: Number, default: 0 },
      resourcesDownloaded: { type: Number, default: 0 },
      messagesSent: { type: Number, default: 0 },
      channelsJoined: { type: Number, default: 0 },
      serversJoined: { type: Number, default: 0 },
      reportsIssued: { type: Number, default: 0 },
      lastActivity: Date,
    },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// Methods
UserSchema.methods.getProfile = function () {
  return this.profile;
};

UserSchema.methods.getAcademics = function () {
  return this.academic;
};

UserSchema.methods.getActivity = function () {
  return this.activity;
};

UserSchema.methods.getIncomingRequests = function () {
  return this.profile.friends.filter((f) => f.status === "incoming");
};

UserSchema.methods.getOutgoingRequests = function () {
  return this.profile.friends.filter((f) => f.status === "outgoing");
};

UserSchema.methods.getAcceptedFriends = function () {
  return this.profile.friends.filter((f) => f.status === "accepted");
};

UserSchema.methods.getBlockedFriends = function () {
  return this.profile.friends.filter((f) => f.status === "blocked");
};

UserSchema.methods.updateLastLogin = function () {
  this.activity.lastLogin = new Date();
  this.activity.totalLogins += 1;
  this.activity.lastActivity = new Date();
  return this.save();
};

UserSchema.methods.updateStatus = function (status) {
  const validStatuses = ["online", "offline", "dnd", "invisible", "idle"];
  if (!validStatuses.includes(status)) throw new Error("Invalid Status");
  this.profile.status = status;
  this.profile.lastSeen = new Date();
  return this.save();
};

UserSchema.methods.updateMessages = function (number) {
  if (typeof number !== "number")
    throw new Error("Number must be a valid number");
  this.activity.messagesSent += number;
  if (this.activity.messagesSent < 0) this.activity.messagesSent = 0;
  return this.save();
};

UserSchema.methods.updateChannels = function (number) {
  if (typeof number !== "number")
    throw new Error("Number must be a valid number");
  this.activity.channelsJoined += number;
  if (this.activity.channelsJoined < 0) this.activity.channelsJoined = 0;
  return this.save();
};

UserSchema.methods.updateServers = function (number) {
  if (typeof number !== "number")
    throw new Error("Number must be a valid number");
  this.activity.serversJoined += number;
  if (this.activity.serversJoined < 0) this.activity.serversJoined = 0;
  return this.save();
};

UserSchema.methods.updateReports = function (number) {
  if (typeof number !== "number")
    throw new Error("Number must be a valid number");
  this.activity.reportsIssued += number;
  if (this.activity.reportsIssued < 0) this.activity.reportsIssued = 0;
  return this.save();
};

UserSchema.methods.updateLastActivity = function () {
  this.activity.lastActivity = new Date();
  this.profile.lastSeen = new Date();
  return this.save();
};

UserSchema.methods.sendFriendRequest = async function (friendId) {
  // Prevent adding yourself
  if (this._id.toString() === friendId.toString())
    throw new Error("Cannot Send Friend Request to Yourself");

  // Check if already friends or request exists
  const existingFriendship = this.profile.friends.find(
    (f) => f.user.toString() === friendId.toString()
  );

  if (existingFriendship) {
    if (existingFriendship.status === "accepted") {
      throw new Error("Already friends with this user");
    }
    throw new Error("Friend request already sent");
  }

  // Push Outgoing Request
  this.profile.friends.push({
    user: friendId,
    status: "outgoing",
  });

  await this.save();

  const User = this.constructor; // Get The Model
  const targetUser = await User.findById(friendId); // Get Target User

  if (!targetUser) throw new Error("Target User not found");

  // Check if User is blocked in Target User's Blocked List
  const blockedUser = targetUser.profile.blockedUsers.find(
    (f) => f.user.toString() === this._id.toString()
  );

  const existingRequest = targetUser.profile.friends.find(
    (f) => f.user.toString() === this._id.toString()
  );

  // Push New Request
  if (!existingRequest && !blockedUser) {
    targetUser.profile.friends.push({
      user: this._id,
      status: "incoming",
    });
    await targetUser.save();
  }

  return this;
};

UserSchema.methods.acceptFriendRequest = async function (friendId) {
  const friendRequest = this.profile.friends.find(
    (f) => f.user.toString() === friendId.toString()
  );

  if (!friendRequest) throw new Error("No friend request found from this user");
  if (friendRequest.status === "accepted") return this;

  friendRequest.status = "accepted";
  friendRequest.since = new Date();

  await this.save();

  const User = this.constructor;
  const friend = await User.findById(friendId);

  if (!friend) throw new Error("Friend user not found");

  const existingFriendship = friend.profile.friends.find(
    (f) => f.user.toString() === this._id.toString()
  );

  if (existingFriendship) {
    existingFriendship.status = "accepted";
    existingFriendship.since = new Date();
  } else {
    friend.profile.friends.push({
      user: this._id,
      status: "accepted",
      since: new Date(),
    });
  }

  await friend.save();
  return this;
};

UserSchema.methods.rejectFriendRequest = async function (friendId) {
  const friendRequest = this.profile.friends.find(
    (f) => f.user.toString() === friendId.toString()
  );
  if (!friendRequest) throw new Error("Friend Request Does not exist");
  friendRequest.status = "rejected";
  friendRequest.since = new Date();

  await this.save();

  const User = this.constructor;
  const user = await User.findById(friendId);

  if (!user) throw new Error("User not found");

  const sentRequest = user.profile.friends.find(
    (f) => f.user.toString() === this._id.toString()
  );

  if (sentRequest) {
    sentRequest.status = "rejected";
    sentRequest.since = new Date();
  }

  await user.save();

  return this;
};

UserSchema.methods.cancelFriendRequest = async function (friendId) {
  this.profile.friends = this.profile.friends.filter(
    (f) =>
      !(f.user.toString() === friendId.toString() && f.status === "outgoing")
  );

  await this.save();

  const User = this.constructor;
  const targetUser = await User.findById(friendId);

  if (targetUser) {
    targetUser.profile.friends = targetUser.profile.friends.filter(
      (f) =>
        !(f.user.toString() === this._id.toString() && f.status === "incoming")
    );
    await targetUser.save();
  }

  return this;
};

UserSchema.methods.removeFriend = async function (friendId) {
  this.profile.friends = this.profile.friends.filter(
    (f) => f.user.toString() !== friendId.toString()
  );

  await this.save();

  const User = this.constructor;
  const friend = await User.findById(friendId);

  if (friend) {
    friend.profile.friends = friend.profile.friends.filter(
      (f) => f.user.toString() !== this._id.toString()
    );
    await friend.save();
  }

  return this;
};

UserSchema.methods.blockUser = async function (userId) {
  const isBlocked = this.profile.blockedUsers.find(
    (id) => id.toString() === userId.toString()
  );

  if (isBlocked) {
    throw new Error("User is Already Blocked");
  } else {
    this.profile.blockedUsers.push(userId);
  }
  await this.save();
  return this;
};

UserSchema.methods.unblockUser = async function (userId) {
  this.profile.blockedUsers = this.profile.blockedUsers.filter(
    (id) => id.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

UserSchema.methods.isOnline = function () {
  return this.profile.status === "online";
};

// Statics
UserSchema.statics.getMessageReports = function () {
  return this.find({}).select("profile.messagesReported");
};

UserSchema.statics.getUserReports = function () {
  return this.find({}).select("profile.usersReported");
};

UserSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
        },
        onlineUsers: {
          $sum: { $cond: [{ $eq: ["$profile.status", "online"] }, 1, 0] },
        },
        studentCount: {
          $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] },
        },
        facultyCount: {
          $sum: { $cond: [{ $eq: ["$role", "faculty"] }, 1, 0] },
        },
        alumniCount: {
          $sum: { $cond: [{ $eq: ["$role", "alumni"] }, 1, 0] },
        },
      },
    },
  ]);
  return stats[0] || {};
};

UserSchema.statics.getMostActiveUsers = function (limit = 10) {
  return this.find({ isActive: true })
    .sort({
      "activity.totalLogins": -1,
      "activity.messagesSent": -1,
    })
    .limit(limit);
};

UserSchema.statics.getRecentJoiners = function (days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    createdAt: { $gte: cutoffDate },
    isActive: true,
  }).sort({ createdAt: -1 });
};

UserSchema.statics.getFriendSuggestions = async function (userId) {
  const user = await this.findById(userId);
  if (!user) throw new Error("User not found");

  const userFriends = user.profile.friends
    .filter((f) => f.status === "accepted")
    .map((f) => f.user);

  return this.find({
    _id: { $ne: userId },
    isActive: true,
    $and: [
      { _id: { $nin: userFriends } },
      { _id: { $nin: user.profile.blockedUsers } },
      {
        $or: [
          { "academic.course": user.academic.course },
          { "academic.dept": user.academic.dept },
        ],
      },
    ],
  });
};

UserSchema.statics.findByStudentId = async function (id) {
  return await this.findOne({ "academic.studentId": id });
};

UserSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email });
};

UserSchema.statics.findByCourse = function (course) {
  return this.find({
    "academic.course": course,
    isActive: true,
  });
};

UserSchema.statics.findClassmates = function (course, semester, year) {
  return this.find({
    "academic.course": course,
    "academic.semester": semester,
    "academic.year": year,
    isActive: true,
  });
};

UserSchema.statics.findByDepartment = function (dept) {
  return this.find({
    "academic.dept": dept,
    isActive: true,
  });
};

UserSchema.statics.findOnlineUsers = function () {
  return this.find({
    "profile.status": { $in: ["online", "idle"] },
    isActive: true,
  });
};

UserSchema.statics.findUsersRequiringPasswordChange = function () {
  return this.find({ mustChangePassword: true });
};

UserSchema.statics.findInactiveUsers = function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    $or: [
      { "activity.lastLogin": { $lt: cutoffDate } },
      { "activity.lastLogin": { $exists: false } },
    ],
    isActive: true,
  });
};

UserSchema.statics.searchUsers = function (query, limit = 20) {
  const searchRegex = new RegExp(query, "i");
  return this.find({
    $or: [{ "profile.userName": searchRegex }],
  });
};
module.exports = mongoose.model("User", UserSchema, "user");
