// Database Objects Schema
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.verifyEmail = require("./verifyEmail.model");
db.attendance = require("./attendance.model");
db.server = require("./server.model");
db.channel = require("./channel.model");
db.serverMember = require("./serverMember.model");
db.message = require("./message.model");
db.resource = require("./resourse.model");
db.subjects = require("./subjects.model");

module.exports = db;
