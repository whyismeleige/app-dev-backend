const mongoose = require('mongoose');

// User Schema
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        email:{
            type: String,
            unique: [true,"Email already exists"],
            required: [true,"Please provide an email"]
        },
        password:{
            type: String,
            required: [true,"Please provide a password"],
            unique: false
        }
    })
)

module.exports = User;