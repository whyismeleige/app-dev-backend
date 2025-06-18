const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true,"Please provide an email"],
        unique: [true,"Email Already Exists"]
    },
    password:{
        type: String,
        required:[true,"Please provide a password"],
        unique: false
    }
})

module.exports = mongoose.models.Users || mongoose.model("Users",UserSchema);