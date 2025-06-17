const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/college_database';

const connectDB = async () => {
   try{
    await mongoose.connect(url);
    console.log('Database is connected');
   }catch(err){
    console.error('Error connecting to the database:',err);
    process.exit(1);
   }
}

connectDB();