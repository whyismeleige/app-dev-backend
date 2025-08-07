// Database Objects Schema
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.userLogin = require('./userLogin.model');
db.verifyEmail = require('./verifyEmail.model');
db.pdf = require('./pdfs.model');
db.subjects = require('./subject.model');
db.attendance = require('./attendance.model');
db.student = require('./student.model');
db.server = require('./server.model');
db.user = require('./user.model');
db.channel = require('./channel.model');

module.exports = db;