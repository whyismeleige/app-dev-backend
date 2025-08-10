require("dotenv").config()
const url = process.env.MONGO_URI
const dbName = process.env.DB_NAME
const db = require('../models');

// Database Connection
const connectDB = () => {
   db.mongoose
      .connect(url,{dbName:"college_database"})
      .then(() => console.log("Successfully connected to MongoDB"))
      .catch((err) => console.log("Connection Error",err))
}

module.exports = connectDB;