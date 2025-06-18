const url = 'mongodb://localhost:27017/college_database'
const db = require('../models');

const connectDB = () => {
   db.mongoose
      .connect(url)
      .then(() => console.log("Successfully connected to MongoDB"))
      .catch((err) => console.log("Connection Error",err))
}

module.exports = connectDB;