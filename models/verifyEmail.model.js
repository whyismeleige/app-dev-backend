const mongoose = require('mongoose');

// OTP Verification Schema
const VerifyEmail = mongoose.model(
    "Email Verification",
    new mongoose.Schema({
        email:{
            type: String,
            unique: [true,"Email already exists"],
            required: [true,"Please provide an email"]
        },
        otp:{
            type: Number,
            required: [true,"Please provide an otp"],
            unique: false
        },
        createdAt: {
            type: Date,
            expires: '2m',
            default: Date.now
        }
    }), 'email verification'
)

module.exports = VerifyEmail