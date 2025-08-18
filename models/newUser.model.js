const mongoose = require('mongoose');

const NewUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is Required'],
        unique: true,
        lowercase: true,
        match: [/^[0-9]/, 'Must use College Email']
    },
    password: {
        type: String,
        required: [true, 'Password is Required'],
        minlength: [8, 'Password must be at least 8 digits'],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ['student', 'admin', 'faculty', 'alumni'],
            message: 'Role must be student,admin,faculty or alumni'
        },
        default: 'student'
    },
    phone: {
        type: String,
    },
    profile: {
        userName: {
            type: String,
            required: [true, 'username is required'],
            trim: true,
            lowercase: true,
        },
        nickName: {
            type: String,
            required: [true, 'Last Name is required'],
            trim: true,
            lowercase: true,
            default: 'Student',
        },
        avatar: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: {
                values: ['online', 'offline', 'dnd', 'invisible', 'idle'],
                message: 'Status must be defined',
            },
            default: 'offline',
        },
        bio: {
            type: String,
            maxlength: 200,
            default: "",
        },
        friends: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'NewUser' },
            status: {
                type: String,
                enum: {
                    values: ['pending', 'accepted', 'blocked'],
                    message: 'Friend Request Status needs to be updated',
                },
                default: 'pending',
            },
            since: { type: Date, default: Date.now }
        }],
        blockedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NewUser',
            default: null,
        }],
        lastSeen: {
            type: Date,
            default: Date.now,
        },
        servers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Server',
            }
        ]
    },
    academic: {
        studentId: {
            type: String,
            unique: true,
            sparse: true,
            match: [/^[0-9]{12}$/, 'Student ID must be 12 digits'],
        },
        course: String,
        dept: String,
        specialization: String,
        semester: {
            type: Number,
            min: [1, 'Semester must be at least 1'],
            max: [8, 'Semester cannot exceed 8'],
        },
        year: String,
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        language: {
            type: String,
            enum: ['english', 'hindi', 'telugu'],
            default: 'english',
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
                enum: ['public', 'college', 'friends', 'private'],
                default: 'college',
            },
            contactVisibility: {
                type: String,
                enum: ['public', 'friends', 'private'],
                default: 'friends',
            },
            activityVisibility: {
                type: String,
                enum: ['public', 'friends', 'private'],
                default: 'private',
            }
        }
    },
    activity: {
        lastLogin: Date,
        totalLogins: { type: Number, default: 0 },
        resourcesDownloaded: { type: Number, default: 0 },
        messagesSent: { type: Number, default: 0 },
        channelsJoined: { type: Number, default: 0 },
        serversJoined: { type: Number, default: 0 },
        lastActivity: Date
    },
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})