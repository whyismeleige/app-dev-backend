const mongoose = require("mongoose");

const ServerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Server name is required"],
      trim: true,
      minlength: [2, "Server name must be at least 2 characters"],
      maxlength: [100, "Server name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "No description provided",
      trim: true,
    },
    icon: {
      type: String,
      default: "https://img.icons8.com/ios-filled/100/university.png",
    },
    banner: {
      type: String,
      default: "",
    },
    serverType: {
      type: String,
      enum: {
        values: [
          "class",
          "department",
          "college",
          "committee",
          "club",
          "project",
          "study_group",
          "general",
        ],
        message: "Invalid Server Type",
      },
      required: [true, "Server Type is required"],
      index: true,
    },
    academicInfo: {
      class: {
        type: String,
        trim: true,
        uppercase: true,
        index: true,
        validate: function (v) {
          if (this.serverType === "class") {
            return v && v.length > 0;
          }
          return true;
        },
        message: "Class is required for class-specific servers",
      },
      year: {
        type: String,
        trim: true,
        maxlength: [3, "Year cannot exceed 4 characters"],
        validate: {
          validator: function (v) {
            if (this.serverType === "class") {
              return v && v.length > 0;
            }
            return true;
          },
          message: "Invalid Year",
        },
        index: true,
      },
      department: {
        type: String,
        trim: true,
        uppercase: true,
        enum: {
          values: [
            "BBA",
            "BSC",
            "BCOM",
            "BA",
            "MCOM",
            "MSC",
            "MBA",
            "MA",
            "ALL",
          ],
          message: "Invalid Department",
        },
        index: true,
      },
      semester: {
        type: Number,
        min: 1,
        max: 8,
        index: { sparse: true },
      },
    },
    organizationInfo: {
      committeeName: {
        type: String,
        trim: true,
        maxlength: [
          100,
          "Committee Name cannot exceed more than 100 characters",
        ],
        index: { sparse: true },
        validate: {
          validator: function (v) {
            if (this.serverType === "committee" || this.serverType === "club") {
              return v && v.length > 0;
            }
            return true;
          },
          message:
            "Committee/Club name is required for committee and club servers",
        },
      },
      organizationType: {
        type: String,
        enum: [
          "technical",
          "cultural",
          "sports",
          "academic",
          "social",
          "professional",
          "recreational",
          "administrative",
        ],
        index: { sparse: true },
      },
      parentOrganization: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },
    accessControl: {
      joinPolicy: {
        type: String,
        enum: ["open", "invite_only", "request_approval", "restricted"],
        default: function () {
          switch (this.serverType) {
            case "class":
              return "restricted";
            case "department":
              return "request_approved";
            case "college":
              return "open";
            case "committee":
              return "invite_only";
            case "club":
              return "invite_only";
            default:
              return "request_approved";
          }
        },
        index: true,
      },
      eligibilityRules: {
        allowedDepartments: [
          {
            type: String,
            enum: [
              "BBA",
              "BSC",
              "BCOM",
              "BA",
              "MBA",
              "MA",
              "MSC",
              "MCOM",
              "ALL",
            ],
          },
        ],
        allowedYears: [String],
        allowedUserTypes: [
          {
            type: String,
            enum: ["student", "faculty", "staff", "admin", "alumni", "guest"],
          },
        ],
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Server must have an owner"],
      index: true,
    },
    leaders: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: [
            "admin",
            "moderator",
            "teaching_assistant",
            "class_representative",
            "committee_head",
          ],
          default: "moderator",
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    features: {
      allowInvites: { type: Boolean, default: true },
      allowFileSharing: { type: Boolean, default: true },
      allowVoiceChannels: { type: Boolean, default: true },
      allowJoshBot: { type: Boolean, default: true },
      allowJosephine: { type: Boolean, default: true },
      moderationLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      verificationLevel: {
        type: String,
        enum: ["none", "low", "medium", "high"],
        default: function () {
          return this.serverType === "class" ? "high" : "low";
        },
      },
      defaultNotifications: {
        type: String,
        enum: ["all", "mentions", "none"],
        default: "mentions",
      },
    },
    afkChannelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      default: null,
    },
    afkTimeout: {
      type: Number,
      default: 300,
      min: [60, "AFK timeout must be at least 60 seconds"],
      max: [3600, "AFK timeout cannot exceed 3600 seconds"],
    },
    limits: {
      maxMembers: {
        type: Number,
        default: function () {
          switch (this.serverType) {
            case "class":
              return 200;
            case "department":
              return 500;
            case "college":
              return 2000;
            default:
              return 150;
          }
        },
        min: [1, "Server must allow at least 1 member"],
        max: [5000, "Server cannot exceed 5000 members"],
      },
      maxChannels: {
        type: Number,
        default: function () {
          switch (this.serverType) {
            case "class":
              return 20;
            case "department":
              return 50;
            case "college":
              return 100;
            default:
              return 25;
          }
        },
        min: 1,
        max: 200,
      },
      maxRoles: {
        type: Number,
        default: 20,
        min: 1,
        max: 100,
      },
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    stats: {
      totalMessages: { type: Number, default: 0 },
      totalMembers: { type: Number, default: 0 },
      activeMembers: { type: Number, default: 0 },
      lastActivity: { type: Date, default: Date.now },
      createdChannels: { type: Number, default: 0 },
      averageOnlineMembers: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: function () {
        return this.serverType === "college" || this.serverType === "general";
      },
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: { sparse: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
ServerSchema.virtual("channels", {
  ref: "Channel",
  localField: "_id",
  foreignField: "serverId",
});

ServerSchema.virtual("members", {
  ref: "Server Member",
  localField: "_id",
  foreignField: "serverId",
});

ServerSchema.virtual("roles", {
  ref: "Role",
  localField: "_id",
  foreignField: "serverId",
});

// Methods
ServerSchema.methods.updateBasicInfo = async function (updates) {
  const allowedFields = [
    "name",
    "description",
    "icons",
    "banner",
    "serverType",
  ];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) this[field] = updates[field];
  });
  return await this.save();
};

ServerSchema.methods.addLeader = async function (userId, role = "moderator") {
  const existingLeader = this.leaders.find(
    (leader) => leader.user.toString() === userId.toString()
  );
  if (!existingLeader) {
    this.leaders.push({ user: userId, role });
    return await this.save();
  }
  return this;
};

ServerSchema.methods.removeLeader = async function (userId) {
  this.leaders = this.leaders.filter(
    (leader) => leader.user.toString() !== userId.toString()
  );
  return await this.save();
};

ServerSchema.methods.updateLeaderRole = async function (userId, newRole) {
  const leader = this.leaders.find(
    (leader) => leader.user.toString() === userId.toString()
  );
  if (leader) {
    leader.role = newRole;
    return await this.save();
  }
  throw new Error("Leader not found");
};

ServerSchema.methods.updateLimits = async function (newLimits) {
  const allowedLimits = ["maxMembers", "maxChannels", "maxRoles"];
  allowedLimits.forEach((limit) => {
    if (newLimits[limit] !== undefined) this.limits[limit] = newLimits[limit];
  });
  return await this.save();
};

ServerSchema.methods.canUserJoin = function (user) {
  const { joinPolicy, eligibilityRules } = this.accessControl;

  if (joinPolicy === "open") return { canJoin: true };
  if (joinPolicy === "invite_only") return { canJoin: false };

  if (eligibilityRules) {
    if (
      eligibilityRules.allowedDepartments.length > 0 &&
      !eligibilityRules.allowedDepartments.includes(user.academic.dept) &&
      !eligibilityRules.allowedDepartments.includes("ALL")
    ) {
      return { canJoin: false, reason: "Department not allowed" };
    }

    if (
      eligibilityRules.allowedYears.length > 0 &&
      !eligibilityRules.allowedYears.includes(user.academic.year)
    ) {
      return { canJoin: false, reason: "Academic Year not allowed" };
    }

    if (
      eligibilityRules.allowedUserTypes.length > 0 &&
      !eligibilityRules.allowedUserTypes.includes(user.role)
    ) {
      return { canJoin: false, reason: "User type not allowed" };
    }
  }
  return { canJoin: true };
};

ServerSchema.methods.generateInviteCode = async function () {
  const crypto = require("crypto");
  let code;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    code = crypto.randomBytes(6).toString("hex").toUpperCase();
    attempts++;

    const existingServer = await this.constructor.findOne({ inviteCode: code });

    if (!existingServer) {
      this.inviteCode = code;
      await this.save();
      return code;
    }
  } while (attempts < maxAttempts);

  throw new Error("Unable to generate unique invite code");
};

// Statics
ServerSchema.statics.findByType = function (serverType, options = {}) {
  const query = { serverType, isActive: true };
  if (options.isPublic !== undefined) query.isPublic = options.isPublic;

  return this.find(query)
    .sort(options.sort || { "stats.lastActivity": -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

ServerSchema.statics.findClassServers = function (
  department,
  year,
  options = {}
) {
  const query = {
    serverType: "class",
    "academicInfo.department": department?.toUpperCase(),
    isActive: true,
  };

  if (year) query["academicInfo.year"] = year.toString();

  return this.find(query)
    .sort({ "academicInfo.class": 1 })
    .limit(options.limit || 50);
};

ServerSchema.statics.getUserEligibleServers = async function (
  user,
  options = {}
) {
  const eligibleServers = await this.find({ isActive: true, isPublic: true });

  return eligibleServers
    .filter((server) => {
      const { canJoin } = server.canUserJoin(user);
      return canJoin;
    })
    .slice(0, options.limit || 20);
};

// Middleware
ServerSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("serverType")) {
    switch (this.serverType) {
      case "class":
        if (!this.academicInfo.class || !this.academicInfo.year) {
          return next(new Error("Class servers must have class and year"));
        }
        break;
      case "committee":
        if (!this.organizationInfo.committeeName) {
          return next(
            new Error("Committee servers must have committee name specified")
          );
        }
        break;
    }
  }
  if (this.isNew && !this.inviteCode && this.features.allowInvites) {
    try {
      await this.generateInviteCode();
    } catch (error) {
      console.warn("Failed to generate invite code", error.message);
    }
  }

  if (this.isModified() && !this.isNew) {
    this.stats.lastActivity = new Date();
  }

  next();
});

module.exports = mongoose.model("Server", ServerSchema, "server");
