const mongoose = require("mongoose");

// User Schema
const UserLogin = mongoose.model(
  "UserLogin",
  new mongoose.Schema({
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Please provide an email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      unique: false,
    },
  }),
  "userLogin"
);

module.exports = UserLogin;
