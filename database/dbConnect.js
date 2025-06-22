require("dotenv").config()
const url = process.env.MONGO_URI
const db = require('../models');

// Database Connection
const connectDB = () => {
   db.mongoose
      .connect(url)
      .then(() => console.log("Successfully connected to MongoDB"))
      .catch((err) => console.log("Connection Error",err))
}

module.exports = connectDB;