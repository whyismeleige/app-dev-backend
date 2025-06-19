// Database Objects Schema
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require('./user.model');
db.verifyEmail = require('./verifyEmail.model')

module.exports = db;